
import { default as Web3 } from 'web3'
import { default as contract } from 'truffle-contract'
import ccjson from  '../../build/contracts/CloudCompute.json'
import { resolve } from 'any-promise';

const cc = contract(ccjson)
let accounts
let account
let ipaddr

var currentAccount = web3.eth.accounts[0];
var accountInterval = setInterval(function() {
  if (web3.eth.accounts[0] !== account) {
    currentAccount = web3.eth.accounts[0];
    account=currentAccount;
    $('#bannerUser').text('Address: '+currentAccount);
  }
}, 2000);

const App={
    init:async ()=>{
        cc.setProvider(web3.currentProvider)
        web3.eth.getAccounts(function (err, accs) {
            if (err != null) {
              alert('There was an error fetching your accounts.')
              return
            }
      
            if (accs.length === 0) {
              alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.")
              return
            }
            accounts = accs
            account = accounts[0]
            currentAccount=accounts[0]
            $('#bannerUser').text('Address: '+currentAccount);
        })
        
        App.bindEvents();
        return await App.initWeb3();
    },

    updateList:async ()=>{
        var ccinstance;
        let cclen;
        
        cc.deployed().then((instance)=>{
            ccinstance=instance;
            //return ccinstance.getAllvmLen.call( { from: account });
            return ccinstance.getAllvmLen({ from: account });
        }).then((value)=>{
            console.log(value.toNumber());
            return value.c[0];
        }).then((value)=>{
            $('#vmlist').empty();
            for (let index = 0; index < value; index++) {
                var local=new Promise((resolve,reject)=>{
                    setTimeout(()=>{
                        resolve(ccinstance.getVm(index,{ from: account }));
                    },50);
                });
                local.then((value)=>{
                    $('#vmlist').append($('<div>').attr('id',index)
                        .append($('<ul>')
                            .append($('<li>').text('Name:'+value[0]))
                            .append($('<li>').text('Core:'+value[1].toNumber()))
                            .append($('<li>').text('RAM:'+value[2].toNumber()))
                            .append($('<li>').text('Vpower:'+value[4].toNumber()))
                            .append($('<li>').text('VRAM:'+value[3].toNumber()))
                            .append($('<li>').text('Type:'+value[5].toNumber())))
                        .append($('<button>').text('Accept')
                            .attr('type','button')
                            //.attr('name','button')
                            .attr('id','A'+index)
                            .click({param:index},App.handleAccept))
                        .append($('<button>').text('Link')
                            .attr('type','button ')
                            .attr('id','L'+index))
                        .append($('<button>').text('Pay to end')
                            .attr('type','button')
                            .attr('id','P'+index))
                        );

                        console.log(value[6]);
                        console.log(currentAccount);
                        if(value[6]!=currentAccount)
                        {
                            $('#A'+index).attr('class','btn btn-success')
                            $('#L'+index).attr('class','btn')
                            $('#P'+index).attr('class','btn')
                        }
                        else
                        {
                            $('#P'+index).attr('class','btn btn-warning')
                            $('#A'+index).attr('class','btn')
                            $('#L'+index).attr('class','btn btn-success')
                        }
                });

                var local2=new Promise((resolve,reject)=>{
                    setTimeout(()=>{
                        resolve(ccinstance.checkStatus(index,{ from: account }));
                    },50);
                });
                local2.then((value)=>{
                    if(value)
                    {
                        //$('#A'+index).attr('class','btn')
                        $('#L'+index).attr('class','btn btn-success')
                        //$('#P'+index).attr('class','btn btn-warning')
                    }
                    else
                    {
                        //$('#P'+index).attr('class','btn')
                        //$('#A'+index).attr('class','btn')
                        $('#L'+index).attr('class','btn')
                    }
                });
                //let vm=ccinstance.getVm(index,{ from: account });
        }
        }).catch((err)=>{
            console.log(err.message);
        });
        
    },


    initWeb3:async ()=>{
        
        return App.updateList();
    },

    
    handleDeploy:()=>{
        console.log('click');
        
        var ccinstance;
        web3.eth.getAccounts((error,accounts)=>{
            if(error)
            {
                console.log(error);
            }
            else
            {
                console.log(currentAccount);
            }
            cc.deployed().then((instance)=>{
                ccinstance=instance;
                return ccinstance.createInstance(
                    parseInt($('#vmtype').val()),
                    $('#vmName').val(),
                    parseInt($('#cpuCore').val()),
                    parseInt($('#memSize').val()),
                    parseInt($('#vmemSize').val()),
                    parseInt($('#vpower').val()),
                    { from: currentAccount });
            }).then((status)=>{
                if(status)
                {
                    App.updateList();
                } 
            }).catch((err)=>{
                console.log(err.message);
            });
        })
    },
    handleAccept:(index)=>{
        var ccinstance;
        console.log(index);
        cc.deployed().then((instance)=>{
            ccinstance=instance;
            return ccinstance.acceptInstance(
                index.data.param,
                ipaddr,
                'test',
                { from: currentAccount });
        }).then((status)=>{
            if(status)
            {
                App.updateList();
            } 
        }).catch((err)=>{
            console.log(err.message);
        });
    },

    handleAccess:(index)=>{
        var ccinstance;
        cc.deployed().then((instance)=>{
            ccinstance=instance;
            return ccinstance.accessVm(
                index,
                { from: currentAccount });
        }).then((status)=>{
            console.log(status[0]);
            console.log(status[1]);
        }).catch((err)=>{
            console.log(err.message);
        });
    },

    bindEvents:async ()=>{
        //$(document).on('click','#deploycc',App.handleDeploy);
        $('#vm').submit((e)=>{
            App.handleDeploy();
            e.preventDefault();
        });

        $(document).on('click','#test',()=>{
            $('#vmtype').val();
        })
        

    }
}

window.App = App

window.addEventListener('load', function () {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
      // Use Mist/MetaMask's provider
      window.web3 = new Web3(web3.currentProvider)
    } else {
      console.warn(
        'No web3 detected. Falling back to http://127.0.0.1:9545.' +
        ' You should remove this fallback when you deploy live, as it\'s inherently insecure.' +
        ' Consider switching to Metamask for development.' +
        ' More info here: http://truffleframework.com/tutorials/truffle-and-metamask'
      )
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      window.web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:9545'))
    }
    $(document).ready(()=>{
        $.get('http://jsonip.com', (res) =>{
            console.log(res.ip);
            ipaddr=res.ip;
            $('#banner').text('Welcome user '+' from: '+ipaddr);
        });
    });
        
    App.init()
  })