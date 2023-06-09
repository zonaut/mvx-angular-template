import { Component, OnInit } from '@angular/core';
import { ElvenJS } from './elven-js/main';
import { LoginMethodsEnum } from './elven-js/types';
import { base64ToDecimalHex, clearQrCodeContainer } from './helpers';
import { Address } from '@multiversx/sdk-core/out/address';
import { ContractFunction } from '@multiversx/sdk-core/out';
import { Alert } from './shared/alert';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  isLoading: boolean = false;
  loggedIn: boolean = false;
  alerts: Alert[] = [];

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
        walletConnectV2ProjectId: 'dbf66ff0813b5425b3063e404c9ba79e',

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
          this.isLoading = false;
        },
        onQrPending: () => {
          this.isLoading = true;
        },
        onQrLoaded: () => {
          this.isLoading = false;
        },
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
      this.alerts.push({
        type: 'success',
        message: `➡️ The result of the query is: ${parseInt(hexVal, 16)}`,
      });
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

  async loginWithXPortal() {
    clearQrCodeContainer();
    try {
      await ElvenJS.login(LoginMethodsEnum.mobile, {
        // You can also use the DOM element here:
        // qrCodeContainer: document.querySelector('#qr-code-container')
        qrCodeContainer: 'qr-code-container',
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

  closeAlert(alert: Alert) {
    this.alerts.splice(this.alerts.indexOf(alert), 1);
  }
}
