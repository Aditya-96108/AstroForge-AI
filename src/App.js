import { useState } from "react";
import Nav from "./components/Nav";
import Landing from "./components/Landing";
import Analyze from "./components/Analyze";
import Charts from "./components/Charts";
import Astrology from "./components/Astrology";
import Goals from "./components/Goals";
import Insights from "./components/Insights";
import PDFSection from "./components/PDFSection";
import StyleInjector from "./components/StyleInjector";

export default function App() {
  const [page, setPage] = useState("landing");
  const [sharedData, setSharedData] = useState({});
  const pages = {
    landing: <Landing setPage={setPage} />,
    analyze: <Analyze setPage={setPage} setSharedData={setSharedData} />,
    charts: <Charts />,
    astrology: <Astrology setSharedData={setSharedData} />,
    goals: <Goals setSharedData={setSharedData} />,
    insights: <Insights sharedData={sharedData} setSharedData={setSharedData} />,
  };
  return (
    <>
      <StyleInjector />
      <Nav page={page} setPage={setPage} />
      <main>
        {pages[page]}
        {page !== "landing" && <PDFSection sharedData={sharedData} />}
      </main>
    </>
  );
}