import ThirdPartyEmailPasswordReact from "supertokens-auth-react/recipe/thirdpartyemailpassword";
import SessionReact from "supertokens-auth-react/recipe/session";
import { appInfo } from "./appInfo";
import Router from "next/router";

export const frontendConfig = () => {
  return {
    appInfo,
    recipeList: [
      ThirdPartyEmailPasswordReact.init({
        signInAndUpFeature: {
          providers: [
            ThirdPartyEmailPasswordReact.Google.init(),
            ThirdPartyEmailPasswordReact.Github.init(),
          ],
        },
      }),
      SessionReact.init(),
    ],
    windowHandler: (original: any) => ({
      ...original,
      location: {
        ...original.location,
        getPathName: () => Router.asPath?.split("?")[0] ?? "/",
        assign: (url: any) => Router.push(url.toString()),
        setHref: (url: any) => Router.push(url.toString()),
      },
    }),
  };
};