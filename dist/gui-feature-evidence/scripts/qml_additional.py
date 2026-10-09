#!/usr/bin/env python3
"""Independent acceptance checks for coin controls after the upstream note test fails."""
import json
from pathlib import Path
from qml_wallet_test_lib import WalletFlowHarness, rpc_call

checks=[]
def check(name,features,description,condition):
    checks.append({'id':name,'features':features,'description':description,'status':'passed' if condition else 'failed'})
    Path('/evidence/logs/qml-additional-checks.json').write_text(json.dumps(checks,indent=2)+'\n')
    assert condition,description
    print(name,': passed',flush=True)

harness=WalletFlowHarness('acceptance_coin_controls',port_offset=1200)
try:
    harness.start_gui();gui=harness.driver
    gui.wait_for_property('walletBadge','loading',False,timeout_ms=20000)
    rpc_call(harness.gui_rpc_port,'createwallet',{'wallet_name':'acceptance_coins'})
    gui.wait_for_property('walletBadge','noWalletLoaded',False,timeout_ms=20000)
    addresses=[rpc_call(harness.gui_rpc_port,'getnewaddress',[label],wallet='acceptance_coins') for label in ['Mining fixture','First recipient','Second recipient']]
    rpc_call(harness.gui_rpc_port,'generatetoaddress',[103,addresses[0]])
    gui.set_property('appWindow','width',1180);gui.set_property('appWindow','height',1000)
    gui.click('sendTabButton');gui.wait_for_page('sendPage')
    gui.set_text('sendAddressInput',addresses[1]);gui.set_text('sendAmountInput','0.018')
    gui.click('sendAddRecipientButton');gui.set_text('sendAddressInput',addresses[2]);gui.set_text('sendAmountInput','0.025')
    gui.click('feeSelectionPickerButton');gui.click('feeSelectionOption3');gui.set_text('feeSelectionCustomRateInput','4.2')
    gui.wait_for_property('sendReviewButton','enabled',True,timeout_ms=20000)
    gui.save_screenshot('/tmp/send-multiple-custom-fee.png')
    check('multiple-recipients-custom-fee',['F09.S01','F11.S02'],'Two recipients with a custom fee can proceed to review.',gui.get_property('sendReviewButton','enabled'))
    gui.click('sendSelectInputsButton');gui.wait_for_property('coinSelectionPopup','opened',True)
    gui.save_screenshot('/tmp/coin-selection-available.png')
    gui.click_list_item('coinSelectionListView',0,'coinSelectionCheckbox')
    gui.wait_for_property('coinSelectionDoneButton','enabled',True)
    gui.save_screenshot('/tmp/coin-selection-selected.png')
    gui.click('coinSelectionDoneButton');gui.wait_for_property('sendInputsSelectedText','text','1 input selected')
    check('select-specific-coin',['F12.S01','F12.S02','F12.S07'],'The send form retains the selected input.',gui.get_text('sendInputsSelectedText')=='1 input selected')
    gui.click('desktopWalletSettingsTabButton');gui.click('settingsSidebar_wallet');gui.wait_for_page('walletSettingsPage');gui.click('walletCoinsRow');gui.wait_for_page('walletCoinsPage')
    gui.save_screenshot('/tmp/wallet-coins.png')
    gui.click('walletCoinsSelectionButton');gui.click_list_item('coinSelectionListView',0,'coinSelectionCheckbox')
    gui.wait_for_property('coinsLockButton','enabled',True);gui.click('coinsLockButton')
    check('lock-coin',['F12.S05'],'Locking a coin through QML changes Core listlockunspent.',len(rpc_call(harness.gui_rpc_port,'listlockunspent',wallet='acceptance_coins'))==1)
    gui.save_screenshot('/tmp/wallet-coin-locked.png')
    gui.click_list_item('coinSelectionListView',0,'coinSelectionCheckbox');gui.wait_for_property('coinsUnlockButton','enabled',True);gui.click('coinsUnlockButton')
    check('unlock-coin',['F12.S05'],'Unlocking the coin clears Core listlockunspent.',rpc_call(harness.gui_rpc_port,'listlockunspent',wallet='acceptance_coins')==[])
    gui.save_screenshot('/tmp/wallet-coin-unlocked.png')
    gui.click('settingsSidebar_wallet');gui.wait_for_page('walletSettingsPage')
    gui.click('walletSignVerifyMessageRow');gui.wait_for_page('signVerifyMessagePage')
    address=rpc_call(harness.gui_rpc_port,'getnewaddress',['Proof of control','legacy'],wallet='acceptance_coins')
    message='Acceptance evidence: regtest only.'
    gui.set_text('signMessageAddressField',address);gui.set_text('signMessageMessageField',message);gui.click('signMessageButton')
    gui.wait_for_property('signMessageSignatureOutput','visible',True)
    signature=gui.get_text('signMessageSignatureText')
    check('sign-message',['F19.S01'],'The live QML signature verifies through RPC.',rpc_call(harness.gui_rpc_port,'verifymessage',[address,signature,message]))
    gui.save_screenshot('/tmp/message-signed-full-view.png')
    gui.click('verifyMessageTab');gui.set_text('verifyMessageAddressField',address);gui.set_text('verifyMessageMessageField',message);gui.set_text('verifyMessageSignatureField',signature);gui.click('verifyMessageButton')
    check('verify-message',['F19.S02'],'The QML form reports successful signature verification.',gui.get_text('verifyMessageResultText')=='Message verified successfully.')
    gui.save_screenshot('/tmp/message-verified-full-view.png')
    rpc_call(harness.gui_rpc_port,'createwallet',{'wallet_name':'second_acceptance_wallet'})
    gui.click('walletBadge');gui.wait_for_property('walletSelectPopup','opened',True)
    gui.save_screenshot('/tmp/multiple-loaded-wallets.png')
    print('Additional acceptance checks passed.',flush=True)
finally:
    harness.stop()
