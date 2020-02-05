#!/usr/bin/env node

const puppeteer = require('puppeteer');
const VideoLoaded = 'The video has now been loaded!';
const util = require('util');
const chalk = require('chalk');
const yargs = require("yargs");
const makeDir = require('make-dir');
const ShakaPlayer = "shaka-player"

const options = yargs
 .usage("Usage: -n <name>")
 .option("h", { alias: "host", describe: "target host", type: "string", demandOption: true })
 .option("chrome-bin", { alias: "bin", describe: "executable chrome path", type: "string", demandOption: true })
 .option("png-output-dir", { alias: "outputdir", describe: "screenshot output dir", type: "string", demandOption: true })
 .option("element-inspect", { alias: "element", describe: "video outlay to be inspected", type: "string", demandOption: true })
 .option("enable-headless", { alias: "headless", describe: "enable headless", type: "boolean", demandOption: true })
 .option("player-observed", { alias: "player", describe: "player to be observed, [shaka-player or anything]", type: "string", demandOption: true })
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
        }).catch( (e) => {
          console.log('error ', e)
        }).then( () => {
            console.log(chalk.green("Write screenshot ",filename))
        });
      }
  makeDir(options.outputdir)
  let fileCounter = 1;
  const browser = await puppeteer.launch({headless:options.headless, executablePath: options.bin, args: ['--no-sandbox']});
  const page = await browser.newPage();
  console.log('hai')
  page.waitForSelector(options.element)
  .then(() => {
    page.on('console', msg => {
      let logMessage = msg.text()
      if (logMessage == VideoLoaded || options.player != ShakaPlayer) {
        console.log("PAGE LOG ", msg.text())
        console.log(chalk.blueBright("Start spawn screenshot..."))
         setInterval(()=>{
             let filename = util.format("%s/screenshot_%s.png", options.outputdir,fileCounter)
             screenshotDOMElement(options.element, 0, filename)
             fileCounter++;
         }, 1000)      
      }
    
  })
  });
  
  await page.goto(options.host);

})();