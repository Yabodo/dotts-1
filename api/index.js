export default function (req, res, next) {
    // req is the Node.js http request object
    console.log(req.url)
  
    // res is the Node.js http response object
    if(req.url === '/date') {
        res.setHeader('Content-Type', 'application/json')
        res.write(JSON.stringify({date: new Date()}))
        res.end()
    }

    if(req.url === '/link') {
        const contentType = req.getHeader('Content-Type')

        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({date: new Date()}))
    }

    // next is a function to call to invoke the next middleware
    // Don't forget to call next at the end if your middleware is not an endpoint!
    next()
  }
  