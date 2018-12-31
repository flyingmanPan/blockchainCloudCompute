
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
    if(account!=currentAccount)
    {
        App.updateList(0);
    }
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

    updateList:async (opcode)=>{
        
        var ccinstance;
        let cclen;
        
        cc.deployed().then((instance)=>{
            ccinstance=instance;
            return ccinstance.getAllvmLen({ from: account });
        }).then((value)=>{
            console.log(value.toNumber());
            return value.toNumber();
        }).then((value)=>{
            $('#vmlist').empty();
            for (let index = 0; index < value; index++) {
                let hadstart;
                let hadend;
                var local2=new Promise((resolve,reject)=>{
                    setTimeout(()=>{
                        resolve(ccinstance.checkStatus(index,{ from: account }));
                    },10);
                });
                local2.then((value)=>{
                    hadstart=value[0];
                    hadend=value[1];
                }).then(()=>{
                    return ccinstance.getVm(index,{ from: account });
                }).then((value)=>{
                    console.log(index+' start:'+hadstart+' end:'+hadend);
                    if(opcode==1)
                    {
                        if(value[6]!=currentAccount||hadstart)
                        {
                            return 1;
                        }
                    }else if(opcode==2)
                    {
                        if(value[6]!=currentAccount||!hadstart||hadend)
                        {
                            return 2;
                        }
                    }else if(opcode==3)
                    {
                        if(value[6]==currentAccount||hadstart)
                        {
                            return 3;
                        }
                    }
                    if(!hadend)
                    {
                    $('#vmlist').append($('<div>').attr('id',index)
                        .append($('<ul>').attr('id','ul'+index).attr('class','items')
                            .append($('<li>').text('Name:'+value[0]).attr('class','properity'))
                            .append($('<li>').text('Core:'+value[1].toNumber()).attr('class','properity'))
                            .append($('<li>').text('RAM:'+value[2].toNumber()).attr('class','properity'))
                            .append($('<li>').text('Vpower:'+value[4].toNumber()).attr('class','properity'))
                            .append($('<li>').text('VRAM:'+value[3].toNumber()).attr('class','properity'))
                            .append($('<li>').text('Type:'+value[5].toNumber()).attr('class','properity')))
                        .append($('<button>').text('Accept')
                            .attr('type','button')
                            .attr('class','btn')
                            .attr('id','A'+index)
                            .click({param:index},App.handleAccept))
                        .append($('<button>').text('Link')
                            .attr('type','button ')
                            .attr('class','btn')
                            .attr('id','L'+index)
                            .click({param:index},App.handleAccess))
                        .append($('<button>').text('Donate 1eth')
                            .attr('type','button')
                            .attr('class','btn')
                            .attr('id','P'+index)
                            .click({param:index},App.handlePayment))
                        .append($('<button>').text('Stop vm')
                            .attr('type','button')
                            .attr('class','btn')
                            .attr('id','S'+index)
                            .click({param:index},App.handleStop))
                        );
                        if(value[6]!=currentAccount)
                        {
                            console.log('start:'+hadstart);
                            
                            if(!hadstart)
                            {
                                $('#A'+index).attr('class','btn btn-success')
                            }
                            $('#P'+index).attr('class','btn')
                            $('#L'+index).attr('class','btn')
                            //$('#P'+index).attr('class','btn')
                        }
                        else
                        {
                            $('#ul'+index).attr('class','my');
                            if(hadstart)
                            {
                                $('#S'+index).attr('class','btn btn-success')
                                $('#L'+index).attr('class','btn btn-success')
                                $('#P'+index).attr('class','btn btn-warning')
                            }
                            else{
                                $('#L'+index).attr('class','btn ')
                                $('#P'+index).attr('class','btn')
                                $('#A'+index).attr('class','btn')
                            }
                        }
                        return 4;
                    }
                    return 5;
                }).then((msg)=>{
                    console.log('main return '+msg);
                    
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

    handleStop:(index)=>{
        var ccinstance;
        cc.deployed().then((instance)=>{
            ccinstance=instance;
            return ccinstance.stopVm(
                index.data.param,
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
    handlePayment:(index)=>{
        var ccinstance;
        cc.deployed().then((instance)=>{
            ccinstance=instance;
            return ccinstance.payment(
                index.data.param,
                { from: currentAccount });
        }).then((addr)=>{
            web3.eth.sendTransaction(
                {from:currentAccount+'',to:addr+'',value:web3.toWei("1", "ether")},
                (err,res)=>{
                    if(err)
                        console.log(err);
                    else
                        console.log('success transfer');
                });
        }).catch((err)=>{
            console.log(err.message);
        });
    },

    handleAccess:(index)=>{
        var ccinstance;
        cc.deployed().then((instance)=>{
            ccinstance=instance;
            return ccinstance.accessVm(
                index.data.param,
                { from: currentAccount });
        }).then((status)=>{
            if(status[0]=='error')
            {
                alert('permission denide');
            }
            else{
                alert('Move to '+status[0]+' with '+status[1]);
            }
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
        
        $('#listall').on('click',()=>{
            App.updateList(0);
        })
        $('#listnotack').on('click',()=>{
            App.updateList(1);
        })
        $('#listack').on('click',()=>{
            App.updateList(2);
        })
        $('#listcanack').on('click',()=>{
            App.updateList(3);
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

