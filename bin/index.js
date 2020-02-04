#!/usr/bin/env node

const puppeteer = require('puppeteer');
const VideoLoaded = 'The video has now been loaded!';
const util = require('util');
const chalk = require('chalk');
const yargs = require("yargs");
const makeDir = require('make-dir');

const options = yargs
 .usage("Usage: -n <name>")
 .option("h", { alias: "host", describe: "target host", type: "string", demandOption: true })
 .option("b", { alias: "bin", describe: "executable chrome path", type: "string", demandOption: true })
 .option("o", { alias: "outputdir", describe: "screenshot output dir", type: "string", demandOption: true })
 .option("e", { alias: "element", describe: "video outlay to be inspected", type: "string", demandOption: true })
 .argv;


(async () => {
    async function screenshotDOMElement(selector, padding = 0, filename = 'screenshot.png') {
        const rect = await page.evaluate(selector => {
          const element = document.querySelector(selector);
          const {x, y, width, height} = element.getBoundingClientRect();
          return {left: x, top: y, width, height, id: element.id};
        }, selector);
      
        return await page.screenshot({
          path: filename,
          clip: {
            x: rect.left - padding,
            y: rect.top - padding,
            width: rect.width + padding * 2,
            height: rect.height + padding * 2
          }
        }).then( () => {
            console.log(chalk.green("Write screenshot ",filename))
        });
      }
  makeDir(options.outputdir)
  let fileCounter = 1;
  const browser = await puppeteer.launch({headless:true, executablePath: options.bin});
  const page = await browser.newPage();
  page.on('console', msg => {
      let logMessage = msg.text()
      if (logMessage == VideoLoaded) {
        console.log("PAGE LOG ", msg.text())
        console.log(chalk.blueBright("Start spawn screenshot..."))
         setInterval(()=>{
             let filename = util.format("%s/screenshot_%s.png", options.outputdir,fileCounter)
             screenshotDOMElement(options.element, 0, filename)
             fileCounter++;
         }, 1000)      
      }
    
  })
  await page.goto(options.host);

})();