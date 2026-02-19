"""
AlgoSplit Escrow Claim Link Smart Contract
Escrow-based claim/redeem links where sender pre-funds the contract and receiver can claim
Uses Algopy (PuyaPy) for contract development

Features:
- Sender creates claim link and funds escrow
- Receiver (or anyone) can claim without sender approval
- Supports ALGO and USDCa (ASA)
- Optional receiver restriction
- Expiry enforcement
- Cancel/refund before expiry if unclaimed
"""
from algopy import (
    ARC4Contract,
    arc4,
    Account,
    Asset,
    UInt64,
    Txn,
    gtxn,
    itxn,
    Global,
    op,
)


class EscrowClaimLink(ARC4Contract):
    """Smart contract for escrow-based claim links"""
    
    def __init__(self) -> None:
        # Initialize global state
        self.claim_count = UInt64(0)
    
    @arc4.abimethod()
    def create_claim_link(
        self,
        payment: gtxn.PaymentTransaction | gtxn.AssetTransferTransaction,
        receiver: Account,
        expiry_time: UInt64,
    ) -> arc4.String:
        """Create a new claim link with escrow funding
        
        Args:
            payment: Payment or asset transfer transaction funding the escrow
            receiver: Account that can claim (use zero address for anyone)
            expiry_time: Unix timestamp when link expires (0 for no expiry)
            
        Returns:
            Claim link ID
        """
        # Verify the payment is to this contract
        assert payment.receiver == Global.current_application_address, "Payment must be to contract"
        
        # Generate unique claim ID
        claim_id = self.claim_count
        self.claim_count += UInt64(1)
        
        # Determine asset ID (0 for ALGO, >0 for ASA)
        asset_id = UInt64(0)
        amount = UInt64(0)
        
        if isinstance(payment, gtxn.PaymentTransaction):
            # ALGO payment
            amount = payment.amount
            asset_id = UInt64(0)
        else:
            # ASA payment
            amount = payment.asset_amount
            asset_id = payment.xfer_asset.id
        
        assert amount > 0, "Amount must be greater than 0"
        
        # Store claim link data in box storage
        # Box name: "claim_" + claim_id (8 bytes)
        box_name = op.concat(arc4.String("claim_").bytes, op.itob(claim_id))
        
        # Create box to store claim data
        # Format: sender (32) + receiver (32) + amount (8) + asset_id (8) + expiry (8) + claimed (1) = 89 bytes
        op.Box.create(box_name, UInt64(89))
        
        # Store data in box
        # Sender address (bytes 0-31)
        op.Box.put(box_name, UInt64(0), Txn.sender.bytes)
        
        # Receiver address (bytes 32-63) - zero address means anyone can claim
        op.Box.put(box_name, UInt64(32), receiver.bytes)
        
        # Amount (bytes 64-71)
        op.Box.put(box_name, UInt64(64), op.itob(amount))
        
        # Asset ID (bytes 72-79)
        op.Box.put(box_name, UInt64(72), op.itob(asset_id))
        
        # Expiry time (bytes 80-87)
        op.Box.put(box_name, UInt64(80), op.itob(expiry_time))
        
        # Claimed flag (byte 88)
        op.Box.put(box_name, UInt64(88), op.bzero(UInt64(1)))  # 0 = not claimed
        
        return arc4.String(f"claim_{claim_id}")
    
    @arc4.abimethod()
    def claim(
        self,
        claim_id: UInt64,
    ) -> arc4.Bool:
        """Claim funds from escrow
        
        Args:
            claim_id: ID of the claim link
            
        Returns:
            True if claim successful
        """
        # Get box name
        box_name = op.concat(arc4.String("claim_").bytes, op.itob(claim_id))
        
        # Verify box exists
        box_exists, _ = op.Box.length(box_name)
        assert box_exists, "Claim link not found"
        
        # Read claim data from box
        sender = Account(op.Box.extract(box_name, UInt64(0), UInt64(32)))
        receiver = Account(op.Box.extract(box_name, UInt64(32), UInt64(32)))
        amount = op.btoi(op.Box.extract(box_name, UInt64(64), UInt64(8)))
        asset_id = op.btoi(op.Box.extract(box_name, UInt64(72), UInt64(8)))
        expiry_time = op.btoi(op.Box.extract(box_name, UInt64(80), UInt64(8)))
        claimed_byte = op.Box.extract(box_name, UInt64(88), UInt64(1))
        
        # Check if already claimed
        assert op.btoi(claimed_byte) == 0, "Already claimed"
        
        # Check expiry
        if expiry_time > UInt64(0):
            assert Global.latest_timestamp < expiry_time, "Claim link expired"
        
        # Check receiver restriction
        # Zero address (all zeros) means anyone can claim
        zero_address = op.bzero(UInt64(32))
        if receiver.bytes != zero_address:
            assert Txn.sender == receiver, "Only specified receiver can claim"
        
        # Mark as claimed
        op.Box.put(box_name, UInt64(88), op.itob(UInt64(1)))
        
        # Send funds to claimer
        if asset_id == UInt64(0):
            # Send ALGO
            itxn.Payment(
                receiver=Txn.sender,
                amount=amount,
                fee=UInt64(0),  # Caller pays fee
            ).submit()
        else:
            # Send ASA
            itxn.AssetTransfer(
                xfer_asset=Asset(asset_id),
                asset_receiver=Txn.sender,
                asset_amount=amount,
                fee=UInt64(0),  # Caller pays fee
            ).submit()
        
        return arc4.Bool(True)
    
    @arc4.abimethod()
    def cancel(
        self,
        claim_id: UInt64,
    ) -> arc4.Bool:
        """Cancel claim link and refund sender
        
        Args:
            claim_id: ID of the claim link
            
        Returns:
            True if cancellation successful
        """
        # Get box name
        box_name = op.concat(arc4.String("claim_").bytes, op.itob(claim_id))
        
        # Verify box exists
        box_exists, _ = op.Box.length(box_name)
        assert box_exists, "Claim link not found"
        
        # Read claim data from box
        sender = Account(op.Box.extract(box_name, UInt64(0), UInt64(32)))
        amount = op.btoi(op.Box.extract(box_name, UInt64(64), UInt64(8)))
        asset_id = op.btoi(op.Box.extract(box_name, UInt64(72), UInt64(8)))
        expiry_time = op.btoi(op.Box.extract(box_name, UInt64(80), UInt64(8)))
        claimed_byte = op.Box.extract(box_name, UInt64(88), UInt64(1))
        
        # Check if already claimed
        assert op.btoi(claimed_byte) == 0, "Already claimed"
        
        # Only sender can cancel
        assert Txn.sender == sender, "Only sender can cancel"
        
        # Can only cancel if expired or sender wants to cancel before expiry
        # For now, allow sender to cancel anytime if not claimed
        
        # Mark as claimed (to prevent double-spend)
        op.Box.put(box_name, UInt64(88), op.itob(UInt64(2)))  # 2 = cancelled
        
        # Refund sender
        if asset_id == UInt64(0):
            # Refund ALGO
            itxn.Payment(
                receiver=sender,
                amount=amount,
                fee=UInt64(0),  # Caller pays fee
            ).submit()
        else:
            # Refund ASA
            itxn.AssetTransfer(
                xfer_asset=Asset(asset_id),
                asset_receiver=sender,
                asset_amount=amount,
                fee=UInt64(0),  # Caller pays fee
            ).submit()
        
        # Delete box to free up storage
        op.Box.delete(box_name)
        
        return arc4.Bool(True)
    
    @arc4.abimethod()
    def get_claim_info(
        self,
        claim_id: UInt64,
    ) -> arc4.Tuple[Account, Account, UInt64, UInt64, UInt64, UInt64]:
        """Get claim link information
        
        Args:
            claim_id: ID of the claim link
            
        Returns:
            Tuple of (sender, receiver, amount, asset_id, expiry_time, claimed)
        """
        # Get box name
        box_name = op.concat(arc4.String("claim_").bytes, op.itob(claim_id))
        
        # Verify box exists
        box_exists, _ = op.Box.length(box_name)
        assert box_exists, "Claim link not found"
        
        # Read claim data from box
        sender = Account(op.Box.extract(box_name, UInt64(0), UInt64(32)))
        receiver = Account(op.Box.extract(box_name, UInt64(32), UInt64(32)))
        amount = op.btoi(op.Box.extract(box_name, UInt64(64), UInt64(8)))
        asset_id = op.btoi(op.Box.extract(box_name, UInt64(72), UInt64(8)))
        expiry_time = op.btoi(op.Box.extract(box_name, UInt64(80), UInt64(8)))
        claimed_byte = op.Box.extract(box_name, UInt64(88), UInt64(1))
        claimed = op.btoi(claimed_byte)
        
        return arc4.Tuple((
            sender,
            receiver,
            amount,
            asset_id,
            expiry_time,
            claimed,
        ))
    
    @arc4.abimethod(allow_actions=["OptIn"])
    def opt_in_asset(
        self,
        asset: Asset,
    ) -> arc4.Bool:
        """Opt contract into an asset (for ASA support)
        
        Args:
            asset: Asset to opt into
            
        Returns:
            True if opt-in successful
        """
        # Opt into asset
        itxn.AssetTransfer(
            xfer_asset=asset,
            asset_receiver=Global.current_application_address,
            asset_amount=UInt64(0),
            fee=UInt64(0),
        ).submit()
        
        return arc4.Bool(True)






