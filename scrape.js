import puppeteer from "puppeteer";
import fs from "fs";
import xlsx from "xlsx";
import chalk from "chalk";
import nanospinner, { createSpinner } from "nanospinner";

const json_file = 'old_data.json';
const xlsx_file = 'internships.xlsx';

let old_data;

fs.readFile(json_file, 'utf-8', (err,data) => {
  if(err){
    console.log(err);
  return;
  }
  old_data = JSON.parse(data);
});

const spinner = createSpinner('Scraping the web for internships...').start();

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const url = 'https://iaeste.org/internships?utf8=%E2%9C%93&ref_no=&discipline%5B%5D=11&internship_type=open&sort=deadline_at'
  await page.goto(url);

  const number_pages = await page.evaluate(()=> 
  document.querySelector('body > main > div:nth-child(5) > div > div.pagination-wrapper > a').innerText.substring(2));

  let internships = [];
  let next_url = url;
  let curr_page = 1;
  do{
    internships = internships.concat(await page.evaluate(()=>
    Array.from(document.querySelectorAll('section.card__body'))
      .map(card => (
          {
          ref: card.querySelector('div > span').innerText,
          duration: card.querySelector('article > div:nth-child(3) > div > div:nth-child(1) > div').innerText,
          within: card.querySelector('article > div:nth-child(4) > div').innerText,
          expiration: card.querySelector('article > div:nth-child(3) > div > div.hide--large > time > span').innerText,
          salary: card.querySelector('article > div:nth-child(5) > div').innerText,
          link: 'https://iaeste.org/internships/' + String(card.querySelector('div > span').innerText).toLowerCase(),
          title: card.querySelector('div.card__title').innerText
      }))
    ))
    curr_page++;
    next_url = `https://iaeste.org/internships?discipline%5B%5D=11&internship_type=open&page=${curr_page}&ref_no=&sort=deadline_at`;
    if(curr_page<= number_pages)
      await page.goto(next_url);
  }while(curr_page <= number_pages);

  spinner.success({text: chalk.bold.cyan("Scraped " + internships.length + " internships.\n")});
  
  writeToFile(internships);
  
  await browser.close();

  extractToSheet(internships);
  
  getNewOffers(old_data, internships);

})();

function extractToSheet(arr){
  let internshipsWS = xlsx.utils.json_to_sheet(arr); 
  
  // Create a new Workbook
  var wb = xlsx.utils.book_new() 

  // Name your sheet
  xlsx.utils.book_append_sheet(wb, internshipsWS, 'IAESTE internships') 

  // export your excel
  xlsx.writeFile(wb, xlsx_file);
}

function writeToFile(arr){
fs.writeFile(json_file, JSON.stringify(arr), function(err) {
    if (err) {
        console.log(err);
    }
});

}

function getNewOffers(older, newer){
  for(var i = 0; i < newer.length; i++){
    for(var j = 0; j < older.length; j++){
      if(newer[i].ref == older[j].ref)
        break;
    }
    if(j >= older.length)
      console.log(
        chalk.bgRed('\nNew Offer:') +
      chalk.yellow('\nreference: ') + newer[i].ref +
      chalk.yellow('\nduration: ' ) + newer[i].duration + 
      chalk.yellow('\nwithin: ' ) + newer[i].within+
      chalk.yellow('\nsalary: ' ) + newer[i].salary+
      chalk.yellow('\nlink: ' ) + newer[i].link+
      chalk.yellow('\ntitle: ' ) + newer[i].title);
  }
}
