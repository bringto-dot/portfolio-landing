import { Header } from "./components/Header";
import { I18nProvider } from "./i18n";
import { About } from "./sections/About";
import { Approach } from "./sections/Approach";
import { Contact } from "./sections/Contact";
import { Faq } from "./sections/Faq";
import { Finale } from "./sections/Finale";
import { Hero } from "./sections/Hero";
import { Projects } from "./sections/Projects";
import { Services } from "./sections/Services";
import { StageProvider } from "./stage/StageProvider";

export function App() {
  return (
    <I18nProvider>
      <StageProvider>
        <Header />
        <main id="main">
          <Hero />
          <About />
          <Projects />
          <Services />
          <Approach />
          <Faq />
          <Contact />
          <Finale />
        </main>
      </StageProvider>
    </I18nProvider>
  );
}
