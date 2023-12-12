import { Composer, Markup, Scenes, session, Telegraf } from "telegraf";
import * as nearAPI from "near-api-js";

const NEAR_RPC_API = 'https://rpc.testnet.near.org';
const provider = new nearAPI.providers.JsonRpcProvider({url:NEAR_RPC_API} );
const stepHandler = new Composer<Scenes.WizardContext>();
const follow_address = 'dev-1684410668019-65962341802455';
const user_address = 'kurodenjiro1.testnet';
const isContractFollow = (transaction: any)=> {
	if (follow_address.includes(transaction.signer_id) || follow_address.includes(transaction.receiver_id)) {
		return true;	
	}
	return false;
	
}
// Objective:

// - To develop a Telegram bot that monitors heroes.build
// - The bot should automatically track and only report new bounties as they are created and when they are completed.

// Key Features of the Bot:

// - New Bounty Alerts: The bot should send a notification whenever a new bounty is posted on the platform.
// - Completion Alerts: The bot should send a notification when a bounty is marked as completed.
// - Message Content: Each alert must include comprehensive details of the bounty:
// + Type and tags of the bounty
// + Title of the bounty
// + Owner of the bounty
// + Deadline
// + Description of the task.
// + How many people wanted & Bounty amount // {\"OneForAll\":{\"number_of_slots\":10,\"amount_per_slot\":\"100000
// + Advanced setting features: KYC, Whitelist, Invoice, Reviewer
// + Link to the bounty for more details.
// - Message Clarity: Messages delivered by the bot should be coherent, easy to understand, and well-structured.

// Smart contract address: bounties.heroes.build
const isUSDtFollow = (transaction: any)=> {
	if (transaction.receiver_id == 'usdt.fakes.testnet' || transaction.receiver_id == 'usdc.fakes.testnet' || transaction.receiver_id == 'dai.fakes.testnet'  || transaction.receiver_id == 'rep.heroe.testnet') {
		console.log(transaction.actions[0].FunctionCall);
		const action = JSON.parse(atob(transaction.actions[0].FunctionCall.args));
		if(action && action.receiver_id == 'dev-1684410668019-65962341802455'){
			return true;
		}
			
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
						//	console.log(JSON.stringify(transaction));
						//claim bounty
							if (isContractFollow(transaction)) {
								console.log('Relevant Transaction Found:');
								await ctx.reply("create bounty")
								console.log(JSON.stringify(transactions));
								await ctx.reply(JSON.stringify(transaction))

								console.log('Data Sent to Endpoint');
							}
							//create bounty
							if (isUSDtFollow(transaction)) {
								//const action = JSON.parse(atob(transaction.actions[0].FunctionCall.args));
								console.log('Relevant Transaction Found:');
								//{"receiver_id":"dev-1684410668019-65962341802455","amount":"10000000","msg":"{\"metadata\":{\"title\":\"123\",\"description\":\"123\",\"category\":\"Marketing\",\"experience\":\"Beginner\",\"tags\":[\"Blockchain\"],\"acceptance_criteria\":\"123\",\"contact_details\":{\"contact\":\"123\",\"contact_type\":\"Discord\"}},\"deadline\":\"WithoutDeadline\",\"claimer_approval\":\"MultipleClaims\",\"kyc_config\":\"KycNotRequired\"}"}
								//{"actions":[{"FunctionCall":{"args":"eyJyZWNlaXZlcl9pZCI6ImRldi0xNjg0NDEwNjY4MDE5LTY1OTYyMzQxODAyNDU1IiwiYW1vdW50IjoiMTAwMDAwMDAiLCJtc2ciOiJ7XCJtZXRhZGF0YVwiOntcInRpdGxlXCI6XCIyMzRcIixcImRlc2NyaXB0aW9uXCI6XCIyMTMxMjNcIixcImNhdGVnb3J5XCI6XCJEZXZlbG9wbWVudFwiLFwiZXhwZXJpZW5jZVwiOlwiSW50ZXJtZWRpYXRlXCIsXCJ0YWdzXCI6W1wiQVBJXCJdLFwiYWNjZXB0YW5jZV9jcml0ZXJpYVwiOlwiMTIzXCIsXCJjb250YWN0X2RldGFpbHNcIjp7XCJjb250YWN0XCI6XCIxMjNcIixcImNvbnRhY3RfdHlwZVwiOlwiVGVsZWdyYW1cIn19LFwiZGVhZGxpbmVcIjp7XCJEdWVEYXRlXCI6e1wiZHVlX2RhdGVcIjpcIjE3MDIzMTQwMDAwMDAwMDAwMDBcIn19LFwiY2xhaW1lcl9hcHByb3ZhbFwiOlwiTXVsdGlwbGVDbGFpbXNcIixcImt5Y19jb25maWdcIjpcIkt5Y05vdFJlcXVpcmVkXCJ9In0=","deposit":"1","gas":300000000000000,"method_name":"ft_transfer_call"}}],"hash":"6rEixq14M3p8QLXLtJbZ3M1tyh8qLZWm9bCbgoaEhA1p","nonce":134385993000190,"public_key":"ed25519:4ybUTAV5DEdTgxP7oZB4sFPPBusRJtsRp5jF6tCQLWwH","receiver_id":"usdt.fakes.testnet","signature":"ed25519:2aARdyq7nTzTCLcjnXSzFgBPdfb6C72duUHfqxRdjVvpgmM3mk4SMioyaLdvvq1wyHPKTRdLZdXAUmZWxyFE9mxM","signer_id":"kurodenjiro1.testnet"}
								//'{"receiver_id":"dev-1684410668019-65962341802455","amount":"10000000","msg":"{\\"metadata\\":{\\"title\\":\\"234\\",\\"description\\":\\"213123\\",\\"category\\":\\"Development\\",\\"experience\\":\\"Intermediate\\",\\"tags\\":[\\"API\\"],\\"acceptance_criteria\\":\\"123\\",\\"contact_details\\":{\\"contact\\":\\"123\\",\\"contact_type\\":\\"Telegram\\"}},\\"deadline\\":{\\"DueDate\\":{\\"due_date\\":\\"1702314000000000000\\"}},\\"claimer_approval\\":\\"MultipleClaims\\",\\"kyc_config\\":\\"KycNotRequired\\"}"}'
								//
								console.log(JSON.stringify(transaction));
								
								const metadata = JSON.parse(JSON.parse(atob(transaction.actions[0].FunctionCall.args)).msg).metadata
								
								const tags = metadata.tags ;
								let tags_element = "";
								if(tags.length > 1){
									const Tagspop = tags.pop();
									tags_element = tags.join(", ") + " and " + Tagspop ;
								}else{
									tags_element = tags[0]
								}
								console.log(metadata);
								const stable_USD = transaction.receiver_id ==  'usdt.fakes.testnet' ? 'USDT.e': transaction.receiver_id ==  'usdc.fakes.testnet' ? 'USDC.e' :  transaction.receiver_id ==  'dai.fakes.testnet' ? "DAI" :  transaction.receiver_id ==  'rep.heroe.testnet' ? "XREP" : "unknown";
								const amount = parseInt(JSON.parse(atob(transaction.actions[0].FunctionCall.args)).amount) / 1e6 + "";
								const advanced_metadata = JSON.parse(JSON.parse(atob(transaction.actions[0].FunctionCall.args)).msg);

								const deadline = advanced_metadata.deadline;
								const kyc_config = advanced_metadata.kyc_config;
								const reviewers = advanced_metadata.reviewers;
								const multitasking = advanced_metadata.multitasking;
								let multitasking_element = ""
								if(multitasking){
									if(multitasking?.OneForAll){
										multitasking_element = parseInt(amount)/parseInt(multitasking.OneForAll.number_of_slots) * multitasking.OneForAll.amount_per_slot/1e6 +"" 
									}
								}
								let reviewers_element = "";
								if(reviewers){
									if(reviewers.MoreReviewers?.more_reviewers){
										reviewers_element='👉 Reviewer\n'
										reviewers.MoreReviewers.more_reviewers.forEach((element : string) => {
											reviewers_element = reviewers_element+element+"\n"
										});
									}
									
								}
								const claimer_approval = advanced_metadata.claimer_approval;
								let claimer_approval_element = ""
								if(claimer_approval){
									if(claimer_approval?.WhitelistWithApprovals?.claimers_whitelist){
										claimer_approval.WhitelistWithApprovals.claimers_whitelist.forEach((element : string) => {
											claimer_approval_element = claimer_approval_element + element +'\n'
										});
									}
								
								}
								const kyc_config_element  = kyc_config ==  'KycNotRequired' ? '' :  kyc_config.KycRequired.kyc_verification_method == 'DuringClaimApproval' ? 'KYC : During Claim Approval\n' : kyc_config.KycRequired.kyc_verification_method == 'WhenCreatingClaim' ? 'KYC : When Creating Claim\n' : '';
								const deadline_element =  deadline == 'WithoutDeadline' ? '' : `👉 Deadline: ${new Date(parseInt(deadline?.DueDate.due_date)/1000000).toLocaleDateString("en-US")}\n\n`
								const contract_element_url = metadata.contact_details.contact_type == "Telegram" ? `https://t.me/${metadata.contact_details.contact}` : metadata.contact_details.contact_type == 'Discord' ? `https://discord.com/users/${metadata.contact_details.contact}` :  metadata.contact_details.contact_type == 'Twitter' ? `https://twitter.com/${metadata.contact_details.contact}` :  metadata.contact_details.contact_type == 'Email' ? metadata.contact_details.contact_type : "Unknown";

								await ctx.replyWithHTML(
									`📣 Calling all <b>${metadata.experience}</b> skill level ! 📣 \n\n` + 
									`Explore the following requirements\n\n<b>- ${metadata.category} Skill:</b>\n` +
									`👉 ${tags_element}\n\n<b>- ${metadata.title}\n</b>` +
									`👉 ${metadata.description}\n\n`+
									`${deadline_element}`+
									`<b>- Acceptance criteria :</b>\n`+
									`👉 ${metadata.acceptance_criteria}\n` +
									`🏦 <b>Paid in ${stable_USD}</b>\n💰 $${amount} \n` +
									`👥 $${multitasking_element} ${stable_USD} per Hunter \n`+
									`💼 <a href="${contract_element_url} ">${metadata.contact_details.contact_type}</a>\n\n` +
									`✏️ Detailed information about bounty!\n\n` +
									`${kyc_config_element}` +
									`${claimer_approval_element}` +
									`${reviewers_element}` +
									`NEARWEEK Service DAO is paid to monitor and validate bounty process and execution, outsource it to safe time on business functions End-to-end.`)
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

const bot = new Telegraf<Scenes.WizardContext>('6705734261:AAGPCIjMr36NAmaims6eEABgxNhvvRjM7to');
const stage = new Scenes.Stage<Scenes.WizardContext>([superWizard], {
	default: "super-wizard",
});
bot.use(session());
bot.use(stage.middleware());

bot.launch();