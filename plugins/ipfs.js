import * as IPFS from 'ipfs';

export default async ({ app }, inject) => {
	const node = await IPFS.create();
	inject('ipfs', () => node);
};
