# IAESTE-offers-web-scraper
A nodejs CLI tool to scrape [iaeste.org](https://iaeste.org) for internships in the CS field using a headless browser, export into an xlsx file and detect if new offers are available since last run.


# How to use?
Simply  cd into the project directory using the terminal and run this command:

    node .
The script will create an `internships.xlsx` file that list all scraped offers with their details, like the title, start date, expiration date, salary, link to the offer, and more.

It will also create an `old_data.json` file. This file contains the history of the previous run. Keep it to detect new available offers since last run.

## Packages used
[puppeteer](https://github.com/puppeteer/puppeteer) | [chalk](https://github.com/chalk/chalk) | [nanospinner](https://github.com/usmanyunusov/nanospinner) | [xlsx](https://github.com/SheetJS/sheetjs)

