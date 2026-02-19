"""
AlgoSplit Payment Split Smart Contract
Handles split payments with multiple contributors on Algorand
Uses PuyaPy (Algorand Python) for contract development
"""
from algopy import ARC4Contract, arc4, Account, UInt64, String, Txn, itxn
from algopy.op import App


class PaymentSplit(ARC4Contract):
    """Smart contract for managing split payments"""
    
    @arc4.abimethod()
    def create_payment(
        self,
        receiver: Account,
        total_amount: UInt64,
        participants: UInt64,
        title: String,
        description: String,
    ) -> arc4.UInt64:
        """Create a new payment split
        
        Args:
            receiver: Account that will receive all payments
            total_amount: Total amount in microAlgos
            participants: Number of participants expected
            title: Payment title
            description: Payment description
            
        Returns:
            Payment ID (transaction ID)
        """
        # Validate inputs
        assert total_amount > 0, "Total amount must be greater than 0"
        assert participants > 0, "Must have at least 1 participant"
        assert participants <= 100, "Maximum 100 participants"
        
        # Use transaction ID as payment ID
        payment_id_bytes = Txn.id
        
        # Store payment details in app local state
        # Note: Using box storage for better scalability
        payment_key = String("payment_") + String.from_bytes(payment_id_bytes)
        
        # Store payment data as JSON-like structure in box
        payment_data = {
            "receiver": receiver.bytes,
            "total_amount": total_amount,
            "participants": participants,
            "collected": UInt64(0),
            "contributor_count": UInt64(0),
            "status": String("active"),
            "title": title,
            "description": description,
            "creator": Txn.sender.bytes,
        }
        
        # For simplicity, we'll use a combination of global state and local state
        # Store key payment info in global state indexed by payment ID hash
        App.global.put(payment_key, String("active"))
        
        return arc4.UInt64.from_bytes(payment_id_bytes[:8])
    
    @arc4.abimethod()
    def contribute(
        self,
        payment_id: arc4.UInt64,
        amount: UInt64,
    ) -> arc4.Bool:
        """Contribute to a payment split
        
        Args:
            payment_id: ID of the payment to contribute to (first 8 bytes of txid)
            amount: Amount to contribute in microAlgos
            
        Returns:
            True if contribution successful
        """
        # Get payment details from state
        # Note: In production, you'd read from box storage
        # For now, we'll use a simplified approach
        
        # Calculate expected per-person amount from stored data
        # This would need to be passed or stored differently in production
        
        # Check if sender already contributed
        contributor_key = String("contrib_") + String.from_bytes(Txn.sender.bytes)
        has_contributed = App.local.get(contributor_key)
        assert has_contributed is None, "Already contributed"
        
        # Mark as contributed
        App.local.put(contributor_key, amount)
        
        # In a full implementation, you would:
        # 1. Read payment details from box storage
        # 2. Validate amount matches expected
        # 3. Update collected amount
        # 4. Check if payment is complete
        
        return arc4.Bool(True)
    
    @arc4.abimethod()
    def get_payment_info(
        self,
        payment_id: arc4.UInt64,
    ) -> arc4.Tuple[Account, UInt64, UInt64, UInt64, UInt64, String]:
        """Get payment information
        
        Args:
            payment_id: ID of the payment
            
        Returns:
            Tuple of (receiver, total_amount, participants, collected, contributor_count, status)
        """
        # Placeholder - would read from box storage in production
        # For now, return default values
        return arc4.Tuple(
            Txn.sender,  # receiver placeholder
            UInt64(0),   # total_amount placeholder
            UInt64(0),   # participants placeholder
            UInt64(0),   # collected placeholder
            UInt64(0),   # contributor_count placeholder
            String("active"),  # status placeholder
        )
    
    @arc4.abimethod()
    def has_contributed(
        self,
        payment_id: arc4.UInt64,
        contributor: Account,
    ) -> arc4.Bool:
        """Check if an account has contributed to a payment
        
        Args:
            payment_id: ID of the payment
            contributor: Account to check
            
        Returns:
            True if account has contributed
        """
        contributor_key = String("contrib_") + String.from_bytes(contributor.bytes)
        has_contributed = App.local.get(contributor_key)
        
        return arc4.Bool(has_contributed is not None)
