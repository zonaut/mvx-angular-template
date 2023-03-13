import {Component, OnInit} from '@angular/core';
import {ElvenJS} from './elven-js/main';
import {LoginMethodsEnum} from './elven-js/types';
import {base64ToDecimalHex} from './helpers';
import {Address} from '@multiversx/sdk-core/out/address';
import {ContractFunction} from '@multiversx/sdk-core/out';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  isLoading: boolean = false;
  loggedIn: boolean = false;

  ngOnInit(): void {
    this.setupElven();
  }

  async setupElven() {
    await ElvenJS.init(
      {
        apiUrl: 'https://devnet-api.multiversx.com',
        chainType: 'devnet',
        apiTimeout: 10000,

        // TODO Replace this with your own project id
        walletConnectV2ProjectId: 'dbf66ff0813b5425b3063e404c9ba79e6',

        walletConnectV2RelayAddresses: ['wss://relay.walletconnect.com'],
        onLoginPending: () => {
          this.isLoading = true
        },
        onLoggedIn: () => {
          this.loggedIn = true;
          this.isLoading = false;
        },
        onLogout: () => {
          this.loggedIn = false;
        }
      }
    );
  }

  async queryContract() {
    try {
      this.isLoading = true;
      const results = await ElvenJS.queryContract({
        address: new Address('erd1qqqqqqqqqqqqqpgq4kuutm0n9r9p7kyez2dh8ta58jfrucg8x8fqm5kp79'),
        func: new ContractFunction('countView'),
        args: []
      });

      this.isLoading = false;

      // Manual decoding of a simple type (number here), this should be done with an ABI
      const hexVal = base64ToDecimalHex(results?.returnData?.[0]);
      window.alert(`➡️ The result of the query is: ${parseInt(hexVal, 16)}`);
    } catch (e: any) {
      this.isLoading = false;
      throw new Error(e?.message);
    }
  }

  async loginWithWebWallet() {
    try {
      await ElvenJS.login(LoginMethodsEnum.webWallet, {
        callbackRoute: '/',
        // The token is optional, but without it you won't get the signature back, if you don't need it you can omit passing it
        token: 'your_token_here'
      });
    } catch (e: any) {
      console.log('Login: Something went wrong, try again!', e?.message);
    }
  }

  async logout() {
    try {
      const isLoggedOut = await ElvenJS.logout();
    } catch (e: any) {
      console.error(e.message);
    }
  }
}
