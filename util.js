const json = require('json-bigint');
const { b64decode } = require('base64-js');

function convertDeposit(amount) {
    const n = BigInt(amount) / BigInt(10 ** 24);
    return n.toString();
}

function handleBase64(strB64) {
    let temp = b64decode(strB64);
    try {
        temp = Buffer.from(temp).toString('utf-8');
    } catch (error) {
        console.error(error);
    }
    return temp;
}

function markdownParser(text) {
    const specialCharacters = ['\\', '_', '*', '[', ']', '(', ')', '~', '`', '>', '<', '&', '#', '+', '-', '=', '|', '{', '}', '.', '!'];
    for (const character of specialCharacters) {
        text = text.replace(new RegExp(character, 'g'), `\\${character}`);
    }
    return text;
}

function createLinkhash(hash) {
    const link = `https://testnet.nearblocks.io/txns/${hash}`;
    const message = `(${link})`;
    return message;
}

function extractAction(tx) {
    return tx.actions;
}

function handleTransaction(tx) {
    let message = `Hash: ${createLinkhash(tx.hash)}\n`;
    const actions = extractAction(tx);
    for (const action of actions) {
        message += '`---------------`\n';
        message += handleAction(tx, action);
    }
    return message;
}

function handleAction(tx, action) {
    if (typeof action === 'string' && action === 'CreateAccount') {
        return handleCreateAccount(tx, action);
    }
    const actionType = Object.keys(action)[0];
    const actionDetail = action[actionType];
    let messageAddon = '';
    switch (actionType) {
        case 'FunctionCall':
            messageAddon = handleFunctionCall(tx, actionDetail);
            break;
        case 'Transfer':
            messageAddon = handleTransfer(tx, actionDetail);
            break;
        case 'DeleteAccount':
            messageAddon = handleDeleteAccount(tx, actionDetail);
            break;
        case 'AddKey':
            messageAddon = handleAddKey(tx, actionDetail);
            break;
        case 'DeleteKey':
            messageAddon = handleDeleteKey(tx, actionDetail);
            break;
        default:
            break;
    }
    return messageAddon;
}

function handleArgs(args) {
    const argsStr = handleBase64(args);
    return json.parse(argsStr);
}

function handleFunctionCall(tx, actionDetail) {
    const signerId = markdownParser(tx.signer_id);
    const receiverId = markdownParser(tx.receiver_id);
    const methodName = markdownParser(actionDetail.method_name);
    const args = markdownParser(JSON.stringify(handleArgs(actionDetail.args), null, 2));
    let message = `*${signerId}* call method _${methodName}_ in *${receiverId}*\n`;
    message += 'Args:\n';
    message += '```\n' + args + '\n```\n';
    message += `Gas: ${actionDetail.gas}\n`;
    return message;
}

function handleCreateAccount(tx, actionDetail) {
    const receiverId = markdownParser(tx.receiver_id);
    const message = `New account - _${receiverId}_ created\n`;
    return message;
}

function handleTransfer(tx, actionDetail) {
    const signerId = markdownParser(tx.signer_id);
    const receiverId = markdownParser(tx.receiver_id);
    const deposit = markdownParser(convertDeposit(actionDetail.deposit));
    const message = `*${signerId}* transfer _${deposit}N_ to *${receiverId}*\n`;
    return message;
}

function handleDeleteAccount(tx, actionDetail) {
    const signerId = markdownParser(tx.signer_id);
    const receiverId = markdownParser(tx.receiver_id);
    const beneficiaryId = markdownParser(actionDetail.beneficiary_id);
    const message = `*${signerId}* delete account _${receiverId}_ and transfer remaining funds to *${beneficiaryId}*\n`;
    return message;
}

function handleAddKey(tx, actionDetail) {
    const receiverId = markdownParser(tx.receiver_id);
    const permission = markdownParser(actionDetail.access_key.permission);
    const publicKey = markdownParser(actionDetail.public_key);
    const message = `New key added for *${receiverId}* with _${permission}_\n`;
    return message + `Public key: ${publicKey}\n`;
}

function handleDeleteKey(tx, actionDetail) {
    const signerId = markdownParser(tx.signer_id);
    const publicKey = markdownParser(actionDetail.public_key);
    const message = `*${signerId}* has deleted a key\n`;
    return message + `Public key: ${publicKey}\n`;
}

module.exports = {
    convertDeposit,
    handleBase64,
    markdownParser,
    createLinkhash,
    extractAction,
    handleTransaction,
    handleAction,
    handleArgs,
    handleFunctionCall,
    handleCreateAccount,
    handleTransfer,
    handleDeleteAccount,
    handleAddKey,
    handleDeleteKey,
};
