'use strict';

const {Contract} = require('fabric-contract-api');
var sha256 = require('js-sha256');

class Bullitt extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        const bullitts = [
            {
		produced: '02.12.2022',
		noOfOwners: 1,
		totalLength: '2430mm',
		frameWidth: '460mm',
		frameType: '7005/T6',
		frameMaterial: 'aluminium',
		colour: 'green',
		weight: '28kg',
		motor: 'e6100',
		battery: '418W/h',
		gearing: 'XT Di2 11Speed',
		owner: 'Mark',
		linkToImages: 'files.larryvsharry.com',
		hashOfImages: '',
		drivenKm: 0,
		averageSpeedKm: 0,
		noOfCharges: 0
            }
        ];

        for (let i = 0; i < bullitts.length; i++) {
            bullitts[i].docType = 'bullitt';
            await ctx.stub.putState('BULLITT' + i, Buffer.from(JSON.stringify(bullitts[i])));
            console.info('Added <--> ', bullitts[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }


    // Query for the bullitt
    async queryBullitt(ctx, bullittNumber) {
        const bullittAsBytes = await ctx.stub.getState(bullittNumber); // get the bullitt from chaincode state
        if (!bullittAsBytes || bullittAsBytes.length === 0) {
            throw new Error(`${bullittNumber} does not exist`);
        }
        console.log(bullittAsBytes.toString());
        return bullittAsBytes.toString();
    }

    // add a new bullitt entry
    async createBullitt(ctx, bullittNumber, produced, totalLength, frameWidth, frameType, frameMaterial, colour, weight, motor, battery, gearing, owner, linkToImages, hashOfImages) {

        const bullitt = {
            produced,
            docType: 'bullitt',
            noOfOwners: 1, 
	    totalLength,
	    frameWidth,
	    frameType,
	    frameMaterial,
	    colour,
	    weight,
	    motor,
	    battery,
	    gearing,
	    owner,
	    linkToImages,
	    hashOfImages,
	    drivenKm: 0,
	    averageSpeedKm: 0,
	    noOfCharges: 0
        };

        await ctx.stub.putState(bullittNumber, Buffer.from(JSON.stringify(bullitt)));
    }
	async changeBullittOwner(ctx, bullittNumber, newOwner, hashOfNewImage, drivenKm, averageSpeedKm, noOfCharges) {
		        console.info('============= START : changeBullittOwner ===========');

		        const bullittAsBytes = await ctx.stub.getState(bullittNumber);
		        if (!bullittAsBytes || bullittAsBytes.length === 0) {
				            throw new Error(`${bullittNumber} does not exist`);
				        }
		        const bullitt = JSON.parse(bullittAsBytes.toString());
			const concatString = hashOfNewImage + bullitt.hashofImages;
			bullitt.owner = newOwner;
			bullitt.noOfOwners++;
			bullitt.hashOfImages = sha256(concatString);
			bullitt.drivenKm += parseInt(drivenKm);
			if (bullitt.averageSpeedKm != 0) {
				bullitt.averageSpeedKm = ((parseInt(averageSpeedKm) + parseInt(bullitt.averageSpeedKm)) / 2);
				} else {
					bullitt.averageSpeedKm = parseInt(averageSpeedKm);
				}
			bullitt.noOfCharges += parseInt(noOfCharges);

		        await ctx.stub.putState(bullittNumber, Buffer.from(JSON.stringify(bullitt)));
		        console.info('============= END : changeBullittOwner ===========');
		    }



    async queryAllBullitts(ctx) {
        const startKey = 'BULLITT0';
        const endKey = 'BULLITT999';

        const iterator = await ctx.stub.getStateByRange(startKey, endKey);

        const allResults = [];
        while (true) {
            const res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString('utf8'));

                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString('utf8');
                }
                allResults.push({Key, Record});
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }

}

module.exports = Bullitt;
