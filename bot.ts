import { Composer, Markup, Scenes, session, Telegraf } from "telegraf";
import * as nearAPI from "near-api-js";

const NEAR_RPC_API = 'https://rpc.testnet.near.org';
const provider = new nearAPI.providers.JsonRpcProvider({url:NEAR_RPC_API} );
const stepHandler = new Composer<Scenes.WizardContext>();
const follow_address = 'dev-1684410668019-65962341802455';
const isContractFollow = (transaction: any)=> {


	if (follow_address.includes(transaction.signer_id) || follow_address.includes(transaction.receiver_id)) {
		return true;
		
	}
	
	return false;
	
}

const superWizard = new Scenes.WizardScene(
	"super-wizard",

	
	

	async(ctx) => {

		

		let latestBlockHeight = 0;

	

		setInterval(async () => {
			try {
				const latestBlock = await provider.block({ finality: 'final' });
				const height = latestBlock.header.height;
	
				if (height === latestBlockHeight) {
					return;
				}
	
				latestBlockHeight = height;
				console.log('Latest Block:', height);

				const chunks = latestBlock.chunks;
	
				for (const chunk of chunks) {
					const chunkTemp = await provider.chunk(chunk.chunk_hash);
					const transactions = chunkTemp.transactions;
					if (transactions.length > 0) {
						
						for (const transaction of transactions) {

							if (isContractFollow(transaction)) {
								console.log('Relevant Transaction Found:');
								console.log(JSON.stringify(transaction));
								
								await ctx.reply(JSON.stringify(transaction))

								console.log('Data Sent to Endpoint');
							}
						}
					}

	}
 } catch (error) {
		console.error('Error Processing Block:', error);
	}
}, 1000)
	},
	stepHandler,


);

const bot = new Telegraf<Scenes.WizardContext>('6349257220:AAEEuBDgDlJ_6h3vI_VzjCcW4XJR7vKsqZw');
const stage = new Scenes.Stage<Scenes.WizardContext>([superWizard], {
	default: "super-wizard",
});
bot.use(session());
bot.use(stage.middleware());

bot.launch();