import { Noto_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css";

const notoSans = Noto_Sans({
    variable: "--font-noto-sans",
    subsets: ["latin"],
});

export const metadata = {
    title: "Torq",
    description: "For Students, By Students",
    icons: {
        icon: "/favicon.ico",
        shortcut: "/favicon.ico",
        apple: "/logo-trans.png",
    },
    openGraph: {
        title: "Torq",
        description: "For Students, By Students",
        url: "https://torq.it",
        siteName: "Torq",
        images: [
            {
                url: "/logo.png",
                width: 300,
                height: 300,
            },
        ],
        locale: "en_IN",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Torq",
        description: "For Students, By Students",
        images: ["/logo.png"],
    }
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${notoSans.variable} antialiased`}>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
