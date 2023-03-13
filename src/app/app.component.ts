import { Component, OnInit } from '@angular/core';
import { ElvenJS } from './elven-js/main';
import { LoginMethodsEnum } from './elven-js/types';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  isVisible: boolean = false;
  loggedIn: boolean = false;

  ngOnInit(): void {
    const initElven = async () => {
      await ElvenJS.init(
        {
          apiUrl: 'https://devnet-api.multiversx.com',
          chainType: 'devnet',
          apiTimeout: 10000,

          // TODO Replace this with your own project id
          walletConnectV2ProjectId: 'dbf66ff0813b5425b3063e404c9ba79e6',

          walletConnectV2RelayAddresses: ['wss://relay.walletconnect.com'],
          onLoginPending: () => {
            this.isVisible = true
          },
          onLoggedIn: () => {
            this.loggedIn = true;
            this.isVisible = false;
          },
          onLogout: () => {
            this.loggedIn = false;
          }
        }
      );
    }

    initElven();
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
