import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../styles/theme.js';
import { AuthUserProvider } from '../firebase/auth';
import '../styles/firebaseui-styling.global.scss';
import Layout from '../components/Layout.js';
import '../styles/globals.css'

export default function App({ Component, pageProps }) {
    return (
        <AuthUserProvider>
            <ThemeProvider theme={theme}>
                <Layout>
                    <Component {...pageProps} />
                </Layout>
            </ThemeProvider>
        </AuthUserProvider>
    );
}