const nearAPI = require('near-api-js');
// const config = require('./config');
// NEAR_RPC_API = config.NEAR_RPC_API;
// follow_address = config.follow_address;

const { NEAR_RPC_API, follow_address } = require('./config.js');

function isContractFollow(data) {
  if (follow_address.includes(data['signer_id']) || follow_address.includes(data['receiver_id']))
    return true;
  return false;
}

var latestBlockHeight = 0;

async function listenLatestBlock() {

  // Create a provider and get the latest block repeatedly
  const provider = new nearAPI.providers.JsonRpcProvider('https://rpc.testnet.near.org');
  setInterval(async () => {
    const latestBlock = await provider.block({ finality: 'final' });
    const height = latestBlock.header.height;
    if (height === latestBlockHeight) {
      return;
    }
    latestBlockHeight = height;
    const chunks = latestBlock.chunks;
    for (const chunk of chunks) {
      const chunkTemp = await provider.chunk(chunk.chunk_hash);
      const transactions = chunkTemp.transactions;
      if (transactions.length > 0) {
        for (const transaction of transactions) {
          const actionObject = transaction.actions[0];
          const action_type = Object.keys(actionObject)[0];
          const detail = actionObject[action_type];
          let temp = {
            hash: transaction.hash,
            signer_id: transaction.signer_id,
            receiver_id: transaction.receiver_id,
            action_type: action_type
          }
          if (action_type === 'FunctionCall') {
            try {
              temp.action_detail = {
                method_name: detail.method_name,
                args: JSON.parse(atob(detail.args)),
                deposit: detail.deposit,
                gas: detail.gas
              }
            } catch (error) {
              temp.action_detail = detail;
            }
          } else {
            temp.action_detail = detail;
          }
          if (isContractFollow(temp)) {
            console.log('Latest Block: ' + height);
            console.log(temp);
            console.log(JSON.stringify(temp.action_detail.args,null,2));
            console.log('==============================')
          }
        }
      }
    }
  }, 1000); // Poll every 1 seconds (adjust the interval as needed)
}

// Call the function
listenLatestBlock().catch(console.error);