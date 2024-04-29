const puppeteer = require("puppeteer");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function scrapeWebsite(phoneNumber) {
  // Remove spaces and replace them with dashes for the URL
  const formattedPhoneNumber = phoneNumber.replace(/\s/g, "-");
  const url = `https://www.whitepages.com/phone/${formattedPhoneNumber}`;

  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.goto(url);

  const htmlContent = await page.content();

  let address = null;
  let full_name_element = null;
  try {
    address = await page.$eval("[data-qa-selector='address']", (element) =>
      element.textContent.trim()
    );

    full_name_element = await page.$eval(
      ".dsk-owner-name-headline",
      (element) => element.textContent
    );
  } catch (error) {
    console.log(`Could not find phone number: ${phoneNumber}`);
  }

  if (full_name_element && address) {
    console.log(`${phoneNumber} : ${full_name_element.trim()} - ${address}`);
  } else if (full_name_element) {
    console.log(`${phoneNumber} : ${full_name_element.trim()}`);
  } else {
    console.log(`.`);
  }

  await browser.close();
}

async function main() {
  const phoneNumbersInput = await new Promise((resolve) => {
    rl.question(
      "Enter one or multiple phone numbers separated by spaces or semicolons: ",
      (answer) => {
        resolve(answer);
        rl.close();
      }
    );
  });

  // Split by semicolons or spaces, excluding (801) from splitting
  const phoneNumbersList = phoneNumbersInput.match(
    /\+?\d[\d -]*\d|\(\d+\) \d+-?\d+/g
  );

  if (!phoneNumbersList) {
    console.log("Invalid input format for phone numbers");
    return;
  }

  for (const phoneNumber of phoneNumbersList) {
    await scrapeWebsite(phoneNumber.trim());
  }
}

main();
