const pdf = require("pdf-creator-node");
const fs = require("fs");
const path = require('path')
// var html = fs.readFileSync("./template.html", "utf8");
exports.createpdf = async function (req, res) {
    let html
    if (req.position == undefined)
        // html = fs.readFileSync(path.join(__dirname, './workshop_certificate.html'), 'utf-8');
      if(req.company == 0) { // if company is o7 services
        html = fs.readFileSync(path.join(__dirname, './o7certificate2.html'), 'utf-8');
      } else {
        html = fs.readFileSync(path.join(__dirname, './SolutionsCertificate.html'), 'utf-8');
      }
    // console.log(__dirname)
    var options = {
        format: 'A3',
        orientation: 'landscape',
        border: '2mm',
        timeout: "100000"
    };


    var params = {
        name: req.name,
        refNo: req.refNo,
        coursename: req.coursename,
        start: req.start,
        end: req.end
    }

    let imgPath;let url;
    if(req.company == 0) { // if company is o7 services
       imgPath = fs.readFileSync(__dirname+ "/certi-bgB.jpg");
        url = {
        image:imgPath.toString('base64'),
        font:path.join(__dirname, './HRegular.ttf')
      }
    } else { // if company is 1 that is o7 solutions
       imgPath = fs.readFileSync(__dirname+ "/o7sol.jpg");
       url = {
        image:imgPath.toString('base64'),
        font:path.join(__dirname, './font2.ttf')
      }
    }

    // var url = {
    //     image:imgPath.toString('base64'),
    //     font:path.join(__dirname, './HRegular.ttf')
    // }
    var document = {
        html: html,
        data: {
            data: params,
            url:url
        },
        path: `server/public/pdf/${req.ID}.pdf`,
        type: "",
    };
    await pdf
        .create(document, options)
        .then((pdfres) => {
            // console.log(pdf);
            res(pdfres)
        })
        .catch((error) => {
            console.error(error);
        });
}
exports.createpdf2 = async function (req, res) {
  let html
  if (req.position == undefined)
      // html = fs.readFileSync(path.join(__dirname, './workshop_certificate.html'), 'utf-8');
      html = fs.readFileSync(path.join(__dirname, './SolutionsCertificate.html'), 'utf-8');
  // console.log(__dirname)
  var options = {
      format: 'A3',
      orientation: 'landscape',
      border: '2mm',
      timeout: "100000"
  };


  var params = {
      name: req.name,
      refNo: req.refNo,
      coursename: req.coursename,
      start: req.start,
      end: req.end
  }
  var imgPath = fs.readFileSync(__dirname+ "/o7sol.jpg");
  var url = {
      image:imgPath.toString('base64'),
      font:path.join(__dirname, './font2.ttf')
  }
  var document = {
      html: html,
      data: {
          data: params,
          url:url
      },
      path: `server/public/pdf/${req.ID}.pdf`,
      type: "",
  };
  await pdf
      .create(document, options)
      .then((pdfres) => {
          // console.log(pdf);
          res(pdfres)
      })
      .catch((error) => {
          console.error(error);
      });
}
