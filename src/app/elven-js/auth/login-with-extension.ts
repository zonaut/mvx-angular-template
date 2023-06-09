import { ls } from '../utils/ls-helpers';
import { initExtensionProvider } from './init-extension-provider';
import { errorParse } from '../utils/error-parse';
import { EventStoreEvents, LoginMethodsEnum } from '../types';
import { getNewLoginExpiresTimestamp } from './expires-at';
import { accountSync } from './account-sync';
import { EventsStore } from '../events-store';

export const loginWithExtension = async (elven: any, token?: string) => {
  const dappProvider = await initExtensionProvider();

  try {
    if (dappProvider) await dappProvider.login();
    EventsStore.run(EventStoreEvents.onLoginPending);
  } catch (e) {
    const err = errorParse(e);
    console.warn(`Something went wrong trying to login the user: ${err}`);
  }

  if (!dappProvider) {
    throw new Error(
      'Error: There were problems with auth provider initialization!'
    );
  }

  const { signature } = dappProvider.account;

  if (token) {
    ls.set('loginToken', token);
  }

  if (signature) {
    ls.set('signature', signature);
  }

  if (elven.networkProvider) {
    try {
      const address = await dappProvider.getAddress();

      if (!address) {
        throw new Error('Canceled!');
      }

      ls.set('address', address);
      ls.set('loginMethod', LoginMethodsEnum.browserExtension);
      ls.set('expires', getNewLoginExpiresTimestamp());

      await accountSync(elven);

      EventsStore.run(EventStoreEvents.onLoggedIn);

      return dappProvider;
    } catch (e: any) {
      console.warn(
        `Something went wrong trying to synchronize the user account: ${e?.message}`
      );
      EventsStore.run(EventStoreEvents.onLogout);
    }
  }

  throw new Error(`Fatal error`);
};
