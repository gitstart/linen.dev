import CardLayout from 'components/layout/CardLayout';
import EmailField from 'components/EmailField';
import { Button } from '@linen/ui';
import Link from 'components/Link';
import Error from 'components/Auth/Error';
import PasswordField from 'components/PasswordField';
import { useState } from 'react';
import { qs } from 'utilities/url';
import {
  AnchorCss,
  onSignInSubmit,
  SignInMode,
  TermsAndPolicy,
} from 'components/Auth';

interface SignInProps {
  csrfToken?: string;
  error?: string;
  email?: string;
  callbackUrl?: string;
  state?: string;
  mode?: SignInMode;
  withLayout?: boolean;
  showSignUp?: (arg: SignInMode) => void;
  onSignIn?: () => void;
}

export default function SignIn({
  csrfToken,
  callbackUrl,
  state,
  withLayout = true,
  showSignUp,
  onSignIn,
  ...props
}: SignInProps) {
  const [email, setEmail] = useState(props.email);
  const [mode, setMode] = useState<SignInMode>(props.mode || 'magic');
  const [error, setError] = useState(props.error);
  const [loading, setLoading] = useState(false);

  const Layout = withLayout
    ? CardLayout
    : (props: any) => <>{props.children}</>;

  return (
    <Layout header="Sign In">
      <Error error={error} />

      <form
        className="px-2"
        onSubmit={(e) =>
          onSignInSubmit({
            setError,
            setLoading,
            callbackUrl,
            onSignIn,
            state,
          })(e, mode)
        }
      >
        <input name="csrfToken" type="hidden" defaultValue={csrfToken} />

        <EmailField
          placeholder="Email address"
          id="email"
          required
          defaultValue={email}
        />

        {mode === 'creds' && (
          <>
            <PasswordField placeholder="Password" id="password" required />
            <p className="text-xs pt-3 text-gray-700 pb-3">
              <a
                href={`/forgot-password?email=${email || ''}`}
                className={AnchorCss}
              >
                Forgot your password?
              </a>
            </p>
          </>
        )}

        <Button type="submit" block disabled={loading}>
          Continue
        </Button>
        {TermsAndPolicy}
        <hr className="my-5" />

        <div className="flex justify-between">
          <p className="text-xs text-gray-600">
            No account? {/* <br /> */}
            <a
              onClick={() => {
                if (showSignUp) showSignUp?.(mode);
                else
                  window.location.href = `/signup?${qs({
                    callbackUrl,
                    email,
                    mode,
                  })}`;
              }}
              className={AnchorCss}
            >
              Sign up for free
            </a>
            .
          </p>
          <p className="w-1/3"></p>
          {mode === 'magic' && (
            <p className="text-xs text-gray-700 pb-3">
              Prefer passwords? {/* <br /> */}
              <a className={AnchorCss} onClick={() => setMode('creds')}>
                Sign in with credentials
              </a>
              .
            </p>
          )}
          {mode === 'creds' && (
            <p className="text-xs text-gray-700 pb-3">
              Prefer email? {/* <br /> */}
              <a className={AnchorCss} onClick={() => setMode('magic')}>
                Sign in with email
              </a>
              .
            </p>
          )}
        </div>
      </form>
    </Layout>
  );
}