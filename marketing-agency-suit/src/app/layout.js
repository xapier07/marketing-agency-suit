import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ProjectProvider } from "@/context/ProjectContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "QuadriLabs | AI Content Platform",
  description: "The fully functional AI content platform for e-commerce businesses.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.className} min-h-screen flex flex-col font-sans`}>
        <ProjectProvider>
          <Header />
            <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
              {children}
            </main>
          <Footer />
        </ProjectProvider>
      </body>
    </html>
  );
}
