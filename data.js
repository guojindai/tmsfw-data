const request = require('request');
const cheerio = require('cheerio');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const CLASS_NUMBER = {
  'numberone': 1,
  'numbertwo': 2,
  'numberthree': 3,
  'numberfour': 4,
  'numberfive': 5,
  'numbersix': 6,
  'numberseven': 7,
  'numbereight': 8,
  'numbernine': 9,
  'numberzero': 0,
}

const urls = {
  '45-108': [
    'http://www.tmsf.com/newhouse/property_330184_331788908_price.htm?isopen=&presellid=12483310&buildingid=12483311&area=90_120&allprice=&housestate=&housetype=&page=1',
    'http://www.tmsf.com/newhouse/property_330184_331788908_price.htm?isopen=&presellid=12483310&buildingid=12483311&area=90_120&allprice=&housestate=&housetype=&page=2',
    'http://www.tmsf.com/newhouse/property_330184_331788908_price.htm?isopen=&presellid=12483310&buildingid=12483311&area=90_120&allprice=&housestate=&housetype=&page=3'
  ],
  '48-125': [
    'http://www.tmsf.com/newhouse/property_330184_331788908_price.htm?isopen=&presellid=12483310&buildingid=12483412&area=120_150&allprice=&housestate=&housetype=&page=1',
    'http://www.tmsf.com/newhouse/property_330184_331788908_price.htm?isopen=&presellid=12483310&buildingid=12483412&area=120_150&allprice=&housestate=&housetype=&page=2',
    'http://www.tmsf.com/newhouse/property_330184_331788908_price.htm?isopen=&presellid=12483310&buildingid=12483412&area=120_150&allprice=&housestate=&housetype=&page=3',
  ],
  '49-125': [
    'http://www.tmsf.com/newhouse/property_330184_331788908_price.htm?isopen=&presellid=12483310&buildingid=12483497&area=120_150&allprice=&housestate=&housetype=&page=1',
    'http://www.tmsf.com/newhouse/property_330184_331788908_price.htm?isopen=&presellid=12483310&buildingid=12483497&area=120_150&allprice=&housestate=&housetype=&page=2',
  ],
  '50-125': [
    'http://www.tmsf.com/newhouse/property_330184_331788908_price.htm?isopen=&presellid=12483310&buildingid=12483582&area=120_150&allprice=&housestate=&housetype=&page=1',
    'http://www.tmsf.com/newhouse/property_330184_331788908_price.htm?isopen=&presellid=12483310&buildingid=12483582&area=120_150&allprice=&housestate=&housetype=&page=2',
    'http://www.tmsf.com/newhouse/property_330184_331788908_price.htm?isopen=&presellid=12483310&buildingid=12483582&area=120_150&allprice=&housestate=&housetype=&page=3',
  ],
  '51-108': [
    'http://www.tmsf.com/newhouse/property_330184_331788908_price.htm?isopen=&presellid=12483310&buildingid=12483667&area=90_120&allprice=&housestate=&housetype=&page=',
    'http://www.tmsf.com/newhouse/property_330184_331788908_price.htm?isopen=&presellid=12483310&buildingid=12483667&area=90_120&allprice=&housestate=&housetype=&page=2',
    'http://www.tmsf.com/newhouse/property_330184_331788908_price.htm?isopen=&presellid=12483310&buildingid=12483667&area=90_120&allprice=&housestate=&housetype=&page=3',
  ],
  '52-108': [
    'http://www.tmsf.com/newhouse/property_330184_331788908_price.htm?isopen=&presellid=12483310&buildingid=12483747&area=90_120&allprice=&housestate=&housetype=&page=1',
    'http://www.tmsf.com/newhouse/property_330184_331788908_price.htm?isopen=&presellid=12483310&buildingid=12483747&area=90_120&allprice=&housestate=&housetype=&page=2',
  ],
  '53-125': [
    'http://www.tmsf.com/newhouse/property_330184_331788908_price.htm?isopen=&presellid=12483310&buildingid=12483832&area=120_150&allprice=&housestate=&housetype=&page=1',
    'http://www.tmsf.com/newhouse/property_330184_331788908_price.htm?isopen=&presellid=12483310&buildingid=12483832&area=120_150&allprice=&housestate=&housetype=&page=2',
    'http://www.tmsf.com/newhouse/property_330184_331788908_price.htm?isopen=&presellid=12483310&buildingid=12483832&area=120_150&allprice=&housestate=&housetype=&page=3',
  ],
  '54-125': [
    'http://www.tmsf.com/newhouse/property_330184_331788908_price.htm?isopen=&presellid=12483310&buildingid=12483917&area=120_150&allprice=&housestate=&housetype=&page=1',
    'http://www.tmsf.com/newhouse/property_330184_331788908_price.htm?isopen=&presellid=12483310&buildingid=12483917&area=120_150&allprice=&housestate=&housetype=&page=2',
    'http://www.tmsf.com/newhouse/property_330184_331788908_price.htm?isopen=&presellid=12483310&buildingid=12483917&area=120_150&allprice=&housestate=&housetype=&page=3',
  ],
}

const data = {};
let taskCount = 0;

function loadData(tag, url) {
  taskCount ++;
  console.log(`loadData: ${tag}, ${url}`);
  request({
    url,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36',
    },
  }, (err, res, body) => {
    const $ = cheerio.load(body);
    const $trs = $('table.sjtd').eq(1).find('tr');
    $trs.each((i, elem) => {
      const $tds = $(elem).find('td');
      if (!data[tag]) {
        data[tag] = {};
      }
      const no = parseInt($tds.eq(1).find('div').text(), 10);
      const floor = parseInt(no / 100, 10);
      const west = no % 2 === 0;
      const price = getClassNumber($, $tds.eq(7).find('span'));
      if (!data[tag][floor]) {
        data[tag][floor] = {};
      }
      if (west) {
        data[tag][floor].west = price;
      } else {
        data[tag][floor].east = price;
      }
    });
    taskCount --;
    if (taskCount === 0) {
      exportData();
    }
  });
}

function getClassNumber($, $elems) {
  let v = 0;
  $elems.each((i, elem) => {
    const nclass = $(elem).attr('class');
    if (nclass === 'numberdor') {
      return false;
    }
    v = v * 10 + CLASS_NUMBER[nclass];
  });
  return Math.round(v / 10000);
}

function exportData() {
  for (let tag in data) {
    const tagData = [];
    for (let floor in data[tag]) {
      tagData.push(Object.assign(data[tag][floor], { floor: parseInt(floor, 10) }));
    }
    tagData.sort((a, b) => a.floor - b.floor);
    const csvWriter = createCsvWriter({
      path: `export/${tag}.csv`,
      header: [
        { id: 'floor', title: 'floor' },
        { id: 'west', title: 'west' },
        { id: 'east', title: 'east' },
      ],
    });
    csvWriter.writeRecords(tagData).then(() => {
      console.log(`export ${tag}`);
    });
  }
}

function main() {
  for (let tag in urls) {
    urls[tag].forEach((url) => {
      loadData(tag, url);
    });
  }
}

main();
