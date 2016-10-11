/**
 * Created by apple on 16/9/13.
 */
const fs = require("fs");
const path = require('path');
import express from 'express';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { RouterContext, match } from 'react-router';
import createLocation from 'history/lib/createLocation';
import getRoutes from './routes';
import renderHTML from '../../dev-config/server/template';

//构建express实例
const app = express();

//读取静态资源
app.use('/static', express.static(process.env.PWD + '/dist/'));

//处理所有的请求地址
app.get('/*', function (req, res) {

  //从url重构出当前地址
  const location = createLocation(req.url);

  //这里的store即为客户端传入的Cookie,将其序列化为JSON对象即可
  let store = {
    server: "server"
  };

  //匹配客户端路由
  match({routes: getRoutes(store), location}, (error, redirectLocation, renderProps) => {

    if (error) {
      res.status(500).send(error.message)
    } else if (redirectLocation) {

      res.redirect(302, redirectLocation.pathname + redirectLocation.search)

    } else if (renderProps) {

      let html = renderToString(<RouterContext {...renderProps} />);

      console.log(html);

      res.status(200).send(renderHTML(html, {key: "value"}, ['/static/vendors.bundle.js', '/static/react.bundle.js']));

    } else {
      res.status(404).send('Not found')
    }
  })
});

//监听地址
const server = app.listen(3001, function () {
  const host = server.address().address;
  const port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});