"""
Deploy TEAL escrow contract directly
No puyapy needed - uses pure TEAL + AlgoSDK
"""
import sys
import os
from pathlib import Path

# Set UTF-8 encoding for Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

def main():
    print("=" * 60)
    print("🚀 DEPLOYING TEAL ESCROW CONTRACT")
    print("=" * 60)
    print()
    
    # Mnemonic
    mnemonic_phrase = "fiscal anchor match uniform dream ancient inherit lake mean side swap bottom comic police layer test vicious business outer trim beef ticket execute absent quality"
    
    try:
        from algosdk import account, mnemonic as mn, logic
        from algosdk.v2client import algod
        from algosdk.transaction import ApplicationCreateTxn, OnComplete, StateSchema, wait_for_confirmation
        import base64
        
        # Get private key and address
        private_key = mn.to_private_key(mnemonic_phrase)
        address = account.address_from_private_key(private_key)
        
        print(f"📍 Deploying from: {address}")
        
        # Connect to testnet
        algod_client = algod.AlgodClient(
            "",
            "https://testnet-api.algonode.cloud",
            headers={"User-Agent": "algosdk"}
        )
        
        # Check balance
        account_info = algod_client.account_info(address)
        balance = account_info['amount'] / 1_000_000
        print(f"💰 Balance: {balance} ALGO")
        
        if balance < 0.3:
            print("\n❌ ERROR: Insufficient balance")
            return False
        
        print("\n📝 Loading TEAL programs...")
        
        # Read TEAL files
        script_dir = Path(__file__).parent
        
        with open(script_dir / "escrow_approval.teal", 'r') as f:
            approval_teal = f.read()
        
        with open(script_dir / "escrow_clear.teal", 'r') as f:
            clear_teal = f.read()
        
        print("✅ TEAL programs loaded")
        print(f"   Approval: {len(approval_teal)} chars")
        print(f"   Clear: {len(clear_teal)} chars")
        
        # Compile TEAL to bytecode
        print("\n🔨 Compiling TEAL...")
        approval_result = algod_client.compile(approval_teal)
        clear_result = algod_client.compile(clear_teal)
        
        approval_bytecode = base64.b64decode(approval_result['result'])
        clear_bytecode = base64.b64decode(clear_result['result'])
        
        print("✅ Compilation successful")
        
        # Get suggested params
        params = algod_client.suggested_params()
        
        print("\n📤 Creating application on blockchain...")
        
        # Create the application
        txn = ApplicationCreateTxn(
            sender=address,
            sp=params,
            on_complete=OnComplete.NoOpOC,
            approval_program=approval_bytecode,
            clear_program=clear_bytecode,
            global_schema=StateSchema(num_uints=1, num_byte_slices=0),  # claim_count
            local_schema=StateSchema(num_uints=0, num_byte_slices=0),
            extra_pages=0,
        )
        
        # Sign and send
        signed_txn = txn.sign(private_key)
        tx_id = algod_client.send_transaction(signed_txn)
        
        print(f"📡 Transaction ID: {tx_id}")
        print("⏳ Waiting for confirmation...")
        
        # Wait for confirmation
        confirmed_txn = wait_for_confirmation(algod_client, tx_id, 4)
        
        app_id = confirmed_txn['application-index']
        app_address = logic.get_application_address(app_id)
        
        print()
        print("=" * 60)
        print("🎉 ESCROW CONTRACT DEPLOYED!")
        print("=" * 60)
        print()
        print(f"📱 App ID: {app_id}")
        print(f"📍 App Address: {app_address}")
        print(f"🌐 Network: Testnet")
        print(f"🔍 Explorer: https://lora.algokit.io/testnet/application/{app_id}")
        print()
        print("✨ Contract Features:")
        print("   ✅ Receives ALGO into escrow")
        print("   ✅ Sends ALGO from escrow to claimer")
        print("   ✅ Supports cancellation/refund")
        print("   ✅ Works with your frontend!")
        print()
        
        # Update .env file
        env_path = Path(__file__).parent.parent / ".env"
        
        print("📝 Updating .env file...")
        
        env_lines = []
        if env_path.exists():
            with open(env_path, 'r', encoding='utf-8') as f:
                env_lines = f.readlines()
        
        # Update or add values
        found_app_id = False
        found_app_address = False
        
        with open(env_path, 'w', encoding='utf-8') as f:
            for line in env_lines:
                if line.startswith('VITE_CLAIM_APP_ID='):
                    f.write(f'VITE_CLAIM_APP_ID={app_id}\n')
                    found_app_id = True
                elif line.startswith('VITE_CLAIM_APP_ADDRESS='):
                    f.write(f'VITE_CLAIM_APP_ADDRESS={app_address}\n')
                    found_app_address = True
                else:
                    f.write(line)
            
            if not found_app_id:
                f.write(f'VITE_CLAIM_APP_ID={app_id}\n')
            if not found_app_address:
                f.write(f'VITE_CLAIM_APP_ADDRESS={app_address}\n')
        
        print("✅ .env file updated!")
        print()
        print("🔄 NEXT STEPS:")
        print("  1. Stop dev server (Ctrl+C)")
        print("  2. Run: npm run dev")
        print("  3. Hard refresh browser (Ctrl+Shift+R)")
        print("  4. Create a NEW claim link")
        print("  5. Claim it - FUNDS WILL TRANSFER! 🎉")
        print()
        print(f"💡 Old contract funds (~0.5-1 ALGO) remain at:")
        print(f"   R6SMHE7FS7TBVLO4UQJWBY3E2QW6L5RYGBVCYPN5RMHELAOMFKUHOLJNC4")
        print()
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)



