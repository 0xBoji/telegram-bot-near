const nearAPI = require('near-api-js');
const request = require('request');
// const config = require('./config');
// NEAR_RPC_API = config.NEAR_RPC_API;
// follow_address = config.follow_address;

const { NEAR_RPC_API, follow_address, push_url } = require('./config.js');

function isContractFollow(transaction) {
  if (follow_address.includes(transaction['signer_id']) || follow_address.includes(transaction['receiver_id']))
    return true;
  return false;
}

function pushData(transaction) {
  request.post(
      push_url,
      { form: { data: JSON.stringify(transaction) } },
      function (error, response, body) {
          if (!error && response.statusCode == 200) {
              console.log(body);
          }
      }
  );
}

// var actions = ["FunctionCall", "CreateAccount", "Transfer", "AddKey", "DeleteAccount"];

var latestBlockHeight = 0;

async function listenLatestBlock() {

  // Create a provider and get the latest block repeatedly
  const provider = new nearAPI.providers.JsonRpcProvider(NEAR_RPC_API);
  setInterval(async () => {
    const latestBlock = await provider.block({ finality: 'final' });
    const height = latestBlock.header.height;
    if (height === latestBlockHeight) {
      return;
    }
    latestBlockHeight = height;
    console.log('Latest Block: ' + height);
    const chunks = latestBlock.chunks;
    for (const chunk of chunks) {
      const chunkTemp = await provider.chunk(chunk.chunk_hash);
      const transactions = chunkTemp.transactions;
      if (transactions.length > 0) {
        for (const transaction of transactions) {
          // const action = Object.keys(transaction.actions[0])[0];
          // if (!actions.includes(action)) {
          //   console.log(transaction);
          //   console.log(JSON.stringify(transaction));
          //   actions.push(action);
          // }
          if (isContractFollow(transaction)) {
            //send to python process
            console.log(JSON.stringify(transaction));
            pushData(transaction);
          }
          // DEBUG
          // console.log(JSON.stringify(transaction));
          // const actionObject = transaction.actions[0];
          // const action_type = Object.keys(actionObject)[0];
          // const detail = actionObject[action_type];
          // let temp = {
          //   hash: transaction.hash,
          //   signer_id: transaction.signer_id,
          //   receiver_id: transaction.receiver_id,
          //   action_type: action_type
          // }
          // if (action_type === 'FunctionCall') {
          //   try {
          //     temp.action_detail = {
          //       method_name: detail.method_name,
          //       args: JSON.parse(atob(detail.args)),
          //       deposit: detail.deposit,
          //       gas: detail.gas
          //     }
          //   } catch (error) {
          //     temp.action_detail = detail;
          //   }
          // } else {
          //   temp.action_detail = detail;
          // }
          // if (isContractFollow(temp)) {
          //   console.log(temp);
          //   console.log(JSON.stringify(temp.action_detail.args,null,2));
          //   console.log('==============================')
          // }
        }
      }
    }
  }, 1000); // Poll every 1 seconds (adjust the interval as needed)
}

// Call the function
listenLatestBlock().catch(console.error);