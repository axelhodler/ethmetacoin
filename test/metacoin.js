contract('MetaCoin', function(accounts) {
  beforeEach(function() {
    this.contract = MetaCoin.deployed();
  });

  it("puts 10000 MetaCoin in the first account", function(done) {
    this.contract.getBalance.call(accounts[0]).then(function(balance) {
      assert.equal(balance.valueOf(), 10000, "10000 wasn't in the first account");
    }).then(done).catch(done);
  });

  it("calls a function that depends on a linked library", function(done){
    var metaCoinBalance;
    var metaCoinEthBalance;

    this.contract.getBalance.call(accounts[0]).then(function(outCoinBalance){
      metaCoinBalance = outCoinBalance.toNumber();
      return this.contract.getBalanceInEth.call(accounts[0]);
    }.bind(this))
      .then(function(outCoinBalanceEth){
      metaCoinEthBalance = outCoinBalanceEth.toNumber();
    }).then(function(){
      assert.equal(metaCoinEthBalance,2*metaCoinBalance,
        "Library function returned unexpeced function, linkage may be broken");
      
    }).then(done).catch(done);
  });

  it("can send coins", function(done) {
    var account_one = accounts[0];
    var account_two = accounts[1];
    var account_one_starting_balance;
    var account_two_starting_balance;
    var account_one_ending_balance;
    var account_two_ending_balance;
    var amountToSend = 10;

    this.contract.getBalance.call(account_one).then(function(balance) {
      account_one_starting_balance = balance.toNumber();
      return this.contract.getBalance.call(account_two);
    }.bind(this)).then(function(balance) {
      account_two_starting_balance = balance.toNumber();
      return this.contract.sendCoin(account_two, amountToSend, {from: account_one});
    }.bind(this)).then(function() {
      return this.contract.getBalance.call(account_one);
    }.bind(this)).then(function(balance) {
      account_one_ending_balance = balance.toNumber();
      return this.contract.getBalance.call(account_two);
    }.bind(this)).then(function(balance) {
      account_two_ending_balance = balance.toNumber();

      assert.equal(account_one_ending_balance, account_one_starting_balance - amountToSend,
        "Amount wasn't correctly taken from the sender");
      assert.equal(account_two_ending_balance, account_two_starting_balance + amountToSend,
        "Amount wasn't correctly sent to the receiver");
    }).then(done).catch(done);
  });

  it("provides balances to the public", function(done) {
    this.contract.balances(accounts[0]).then(function(balance) {
      assert.equal(balance.valueOf(), 9990);
    }).then(done).catch(done);
  });

  it("can list all balances", function(done) {
    var count = 0;
    var balances = [];
    this.contract.accountCount().then(function(accountCount) {
      for (i = 0; i < accountCount; i++) {
        this.contract.accountIndex(i).then(function(address) {
          this.contract.balances(address).then(function(balance) {
            balances.push({'address': address, 'balance': balance.valueOf()});
            if (count == 0) {
              assert.equal(balances[0].balance, 9990);
              count++;
            } else {
              assert.equal(balances[1].balance, 10);
              done();
            }
          });
        }.bind(this));
      }
    }.bind(this));
  });

  it("does not increase account count when sending to existing accounts", function(done) {
    this.contract.sendCoin(accounts[1], 1000, {from: accounts[0]}).then(function() {
      this.contract.accountCount().then(function(accountCount) {
        assert.equal(accountCount.valueOf(), 2);
        done();
      });
    }.bind(this));
  });
});
