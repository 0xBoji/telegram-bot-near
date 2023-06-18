const nearAPI = require('near-api-js');


var latestBlockHeight = 0;

async function listenLatestBlock() {
  // Create a NEAR connection
  const near = await nearAPI.connect({
    networkId: 'testnet', // Specify the network ID (e.g., 'testnet' for the NEAR TestNet)
    keyStore: new nearAPI.keyStores.InMemoryKeyStore(), // Use the default in-memory key store
    nodeUrl: 'https://rpc.testnet.near.org', // Specify the NEAR RPC node URL
  });

  // Create a provider and get the latest block repeatedly
  const provider = new nearAPI.providers.JsonRpcProvider('https://rpc.testnet.near.org');
  setInterval(async () => {
    const latestBlock = await provider.block({ finality: 'final' });
    const height = latestBlock.header.height;
    if (height === latestBlockHeight) {
      return;
    }
    latestBlockHeight = height;
    // console.log(latestBlock);
    const chunks = latestBlock.chunks;
    console.log('Latest Block: ' + height);
    for (const chunk of chunks) {
      const chunkTemp = await provider.chunk(chunk.chunk_hash);
      // console.log(chunkTemp);
      const transactions = chunkTemp.transactions;
      // const receipts = chunkTemp.receipts;
      // console.log(JSON.stringify(receipts));
      if (transactions.length > 0) {
        for (const transaction of transactions) {
          // console.log('transaction hash: ' + transaction.hash);
          // console.log(transaction);
          // console.log(transaction.actions);
          // const args = atob(transaction.actions.args);
          // const method_name = transaction.actions.method_name;
          // console.log('args: ' + args);
          // console.log('method name: ' + method_name);
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
          console.log(temp);
          console.log(JSON.stringify(temp.action_detail.args,null,2));
        }
      }
    }
    console.log('+++++++++++++++++++++')
  }, 1000); // Poll every 5 seconds (adjust the interval as needed)
}

// Call the function
listenLatestBlock().catch(console.error);