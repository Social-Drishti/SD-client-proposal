import puppeteer from "puppeteer-core";
import { existsSync, mkdirSync } from "fs";
import { join, resolve } from "path";

const PROPOSAL_URL = "https://sd-client-proposal.vercel.app/#proposal=%7B%22id%22%3A%22prop-social-drishti-001%22%2C%22title%22%3A%22Social%20Media%20Management%20%26%20Video%20Production%20Proposal%22%2C%22createdAt%22%3A%222026-08-07%22%2C%22updatedAt%22%3A%222026-08-17T05%3A43%3A42.528Z%22%2C%22agency%22%3A%7B%22name%22%3A%22SOCIAL%20DRISHTI%22%2C%22tagline%22%3A%22LOOKING%20BEYOND%20THE%20OBVIOUS%22%2C%22logoUrl%22%3A%22%2Fblack-sd-logo.png%22%2C%22footerLogoUrl%22%3A%22%2FSD-LOGO.png%22%2C%22email%22%3A%22info%40socialdrishti.com%22%2C%22phone%22%3A%22%2B91%2083691%2082198%22%2C%22website%22%3A%22www.socialdrishti.com%22%2C%22address%22%3A%22Goregoan%7C%20Mumbai%22%7D%2C%22client%22%3A%7B%22name%22%3A%22Mr.%20Ritesh%20%22%2C%22role%22%3A%22%22%2C%22company%22%3A%22%22%2C%22email%22%3A%22dr.rajneesh%40wellness.com%22%2C%22phone%22%3A%22%2B91%2098123%2045678%22%7D%2C%22theme%22%3A%7B%22templateId%22%3A%22social-drishti%22%2C%22primaryColor%22%3A%22%2300838f%22%2C%22accentColor%22%3A%22%23f59e0b%22%2C%22secondaryColor%22%3A%22%230f172a%22%2C%22bgGradientStyle%22%3A%22teal-wave%22%2C%22fontFamily%22%3A%22Plus%20Jakarta%20Sans%22%2C%22showLogoOnPages%22%3Atrue%2C%22showPageNumbers%22%3Atrue%2C%22customFooterText%22%3A%22%22%2C%22showWatermark%22%3Atrue%2C%22watermarkType%22%3A%22logo%22%2C%22watermarkLogoUrl%22%3A%22%2FSD-LOGO.png%22%2C%22watermarkOpacity%22%3A0.06%7D%2C%22pages%22%3A%5B%7B%22id%22%3A%22page-cover%22%2C%22pageTitle%22%3A%22Cover%20Page%22%2C%22type%22%3A%22cover%22%2C%22data%22%3A%7B%22mainTitle%22%3A%22Social%20Media%20Management%20Proposal%22%2C%22subtitle%22%3A%22Prepared%20Exclusively%20For%22%2C%22clientName%22%3A%22Forward%20NX%22%2C%22clientRole%22%3A%22Clothing%20%22%2C%22dateText%22%3A%22August%202026%22%7D%7D%2C%7B%22id%22%3A%22page-smm-1%22%2C%22pageTitle%22%3A%22Social%20Media%20Management%20%28Scope%29%22%2C%22type%22%3A%22category-table%22%2C%22accentBarColor%22%3A%22%23f59e0b%22%2C%22data%22%3A%7B%22categoryTitle%22%3A%22CATEGORY%22%2C%22detailsTitle%22%3A%22DETAILS%22%2C%22rows%22%3A%5B%7B%22id%22%3A%22r1%22%2C%22category%22%3A%22Platforms%22%2C%22details%22%3A%22Instagram%20%26%20Facebook%22%7D%2C%7B%22id%22%3A%22r2%22%2C%22category%22%3A%22Posts%22%2C%22details%22%3A%2210%20posts%20per%20month%20%28Instagram%2C%20Facebook%29%5Cn10%20Story%20per%20month%5Cn%E2%80%A2%20Reels%2C%20Remaining%20Static%2FCarousel%2C%5Cn%E2%80%A2%20Grid%20planning%5Cn%E2%80%A2%20Aesthetic%20looks%2C%20Moodboard%22%7D%2C%7B%22id%22%3A%22r3%22%2C%22category%22%3A%22Strategy%22%2C%22details%22%3A%22%E2%80%A2%20Hashtag%20research%20and%20social%20media%20strategy%5Cn%E2%80%A2%20Content%20and%20brand%20positioning%20planning%5Cn%E2%80%A2%20Monthly%20social%20media%20strategy%5Cn%E2%80%A2%20Posting%20and%20scheduling%5Cn%E2%80%A2%20ORM%20%28Online%20Reputation%20Management%29%22%7D%2C%7B%22id%22%3A%22r4%22%2C%22category%22%3A%22Optimization%22%2C%22details%22%3A%22Page%20optimization%20%26%20periodic%20suggestions%20based%20on%20research%22%7D%2C%7B%22id%22%3A%22r5%22%2C%22category%22%3A%22Content%22%2C%22details%22%3A%22Monthly%20content%20calendar%20planning%5CnCopywriting%20and%20caption%20writing%22%7D%2C%7B%22id%22%3A%22r6%22%2C%22category%22%3A%22Designing%22%2C%22details%22%3A%22Making%20visual%20creatives%20based%20on%20brand%20tonality%20%282%20revisions%20per%20post%20on%20static%20creatives%29%22%7D%5D%7D%7D%2C%7B%22id%22%3A%22page-smm-2%22%2C%22pageTitle%22%3A%22Social%20Media%20Management%20%28Operations%29%22%2C%22type%22%3A%22category-table%22%2C%22accentBarColor%22%3A%22%23f59e0b%22%2C%22data%22%3A%7B%22categoryTitle%22%3A%22CATEGORY%22%2C%22detailsTitle%22%3A%22DETAILS%22%2C%22rows%22%3A%5B%7B%22id%22%3A%22r7%22%2C%22category%22%3A%22Scheduling%20%26%20Publishing%22%2C%22details%22%3A%22Optimal%20time%20posting%20on%20decided%20platforms%22%7D%2C%7B%22id%22%3A%22r8%22%2C%22category%22%3A%22Engagement%22%2C%22details%22%3A%22Image%2Flocation%20tagging%2C%22%7D%2C%7B%22id%22%3A%22r9%22%2C%22category%22%3A%22Monitoring%22%2C%22details%22%3A%22Community%20management%20%28comment%20and%20DM%20monitoring%29%22%7D%2C%7B%22id%22%3A%22r10%22%2C%22category%22%3A%22Reporting%22%2C%22details%22%3A%22Monthly%20performance%20report%20and%20insights%22%7D%2C%7B%22id%22%3A%22r11%22%2C%22category%22%3A%22Complimentary%22%2C%22details%22%3A%22Festive%20stories%22%7D%5D%7D%7D%2C%7B%22id%22%3A%22page-pricing%22%2C%22pageTitle%22%3A%22Investment%20%26%20Commercials%22%2C%22type%22%3A%22pricing-highlight%22%2C%22accentBarColor%22%3A%22%23f59e0b%22%2C%22data%22%3A%7B%22highlightBoxTitle%22%3A%22Monthly%20%E2%80%93%20INR%2035%2C000%20%2B%2018%25%20GST%22%2C%22highlightBoxSubtitle%22%3A%22%28Minimum%20Lock-in%20Period%203%20Months%29%22%2C%22notesHeader%22%3A%22Note%22%2C%22notes%22%3A%5B%7B%22id%22%3A%22n1%22%2C%22title%22%3A%22Post%20Promotion%22%2C%22description%22%3A%22If%20any%20post%20requires%20boosting%2C%20it%20will%20involve%20an%20additional%20cost%2C%20which%20must%20be%20approved%20and%20paid%20by%20the%20client%20in%20advance.%22%7D%2C%7B%22id%22%3A%22n2%22%2C%22title%22%3A%22Extra%20Designs%22%2C%22description%22%3A%22Any%20design%20work%20outside%20the%20agreed%20scope%20%28e.g.%2C%20social%20media%20post%20%26%20banner%29%20will%20be%20billed%20as%20per%20standard%20rate%20card.%22%7D%5D%7D%7D%5D%7D";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUTPUT_DIR = resolve("./downloads");

async function main() {
  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log("Launching Chrome...");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  console.log("Opening proposal...");
  await page.goto(PROPOSAL_URL, { waitUntil: "networkidle2", timeout: 60000 });

  console.log("Waiting for pages to render...");
  await page.waitForSelector(".a4-page", { timeout: 30000 });
  await new Promise((r) => setTimeout(r, 4000));

  const pageCount = await page.evaluate(() => document.querySelectorAll(".a4-page").length);
  console.log(`Found ${pageCount} pages. Generating PDF...`);

  const outputPath = join(OUTPUT_DIR, "Social_Drishti_Proposal.pdf");
  await page.pdf({
    path: outputPath,
    format: "A4",
    printBackground: true,
    preferCSSPageSize: false,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });

  console.log(`PDF saved to: ${outputPath}`);
  await browser.close();
  console.log("Done!");
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
