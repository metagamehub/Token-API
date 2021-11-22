//import { createWatcher } from '@makerdao/multicall';
const { createWatcher } = require('@makerdao/multicall');

const mgh = '0x8765b1a0eb57ca49be7eacd35b24a574d0203656';
const vesting = '0x29fb510ffc4db425d6e2d22331aab3f31c1f1771';
const treasury = '0x5280a2c3f03be6a053f31da3d64533a19255052a';
const multisig = '0x2a9Da28bCbF97A8C008Fd211f5127b860613922D';
const lp = '0xe9b145aea2a1157dc8b0375f0792b2edce9de709';
const oldSale = '0xd7806003635d0b815d935c61986cf67fa346df8a';
const newSale = '0xb8368cef0b57e210d6508dfb4131f64bd00e0169';

let totalSupply = 0;
let circulatingSupply = 0;

let Balances = [0,0,0,0,0];

const config = {
    rpcUrl: 'https://mainnet.infura.io/v3/235efa9d59c34db8b7f383496c242855',
    multicallAddress: '0xeefba1e63905ef1d7acba5a8513c70307c1ce441',
    interval: 1000
};

(async() => {

    console.log("started");
    const watcher = createWatcher(
        [
          {
            target: mgh,
            call: ['totalSupply()(uint256)'],
            returns: [['TOTAL_SUPPLY', val => val / 10 ** 18]]
          },
          {
            target: mgh,
            call: ['balanceOf(address)(uint256)', vesting],
            returns: [['VESTING', val => val / 10 ** 18]]
          },
          {
            target: mgh,
            call: ['balanceOf(address)(uint256)', treasury],
            returns: [['TREASURY', val => val / 10 ** 18]]
          },
          {
            target: mgh,
            call: ['balanceOf(address)(uint256)', multisig],
            returns: [['MULTISIG', val => val / 10 ** 18]]
          },
          {
            target: mgh,
            call: ['balanceOf(address)(uint256)', lp],
            returns: [['LP', val => val / 10 ** 18]]
          },
          {
            target: mgh,
            call: ['balanceOf(address)(uint256)', oldSale],
            returns: [['OLD_SALE', val => val / 10 ** 18]]
          },
          {
            target: mgh,
            call: ['balanceOf(address)(uint256)', newSale],
            returns: [['NEW_SALE', val => val / 10 ** 18]]
          }
        ],
        config
    );

    await watcher.start();

    watcher.subscribe(update => {
        console.log(`Update: ${update.type} = ${update.value}`);
        try {
            switch (update.type) {
                case 'VESTING':
                    Balances[0] = update.value;
                    break;
                case 'TREASURY':
                    Balances[1] = update.value;
                    break;
                case 'MULTISIG':
                    Balances[2] = update.value;
                    break;
                case 'LP':
                    Balances[3] = update.value;
                    break;
                case 'OLD_SALE':
                    Balances[4] = update.value;
                    break;
                case 'NEW_SALE':
                    Balances[5] = update.value;
                    break;
                case 'TOTAL_SUPPLY':
                    totalSupply = update.value;
                    break;
            }
        } catch (error) {
            console.log(error);
        }
        circulatingSupply = updateSupply();
        console.log(circulatingSupply);
    });

    function updateSupply() {
        let lockedSupply = sum();
        return totalSupply - (lockedSupply);
    }

    function sum() {
        let locked = 0;
        for (let i = 0; i < Balances.length; i++) {
            locked = locked + Balances[i];
        }
        return locked;
    }

    setTimeout(() => {
        console.log('Updating calls...');
        const fetchWaiter = watcher.tap(calls => [
          ...calls,
        ]);
        fetchWaiter.then(() => {
          console.log('Initial fetch completed');
        });
      }, 1000);
})();

(async () => {
    await new Promise(res => {
      setTimeout(res, 10000000);
    });
})();