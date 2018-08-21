const express = require('express'); //подключаем фреймворк для нодЖС для удобвства
const mongoose = require('mongoose'); //подключаем фреймворк для работы с MongoDB базой данный
const bodyParser = require('body-parser');
const users = require('./routes/api/users');
const posts = require('./routes/api/posts');
const path = require('path');
const port = process.env.PORT || 5000;
const app = express(); //инициализируем сервер
const http = require('http').Server(app);
const io = require('socket.io')(http);

const User = require('./models/User');

// bodyparser middleware (Middle ware - функция промежуточной обработки)
app.use(bodyParser.urlencoded({ extended: false })); //для того, чтобы парсился Жсон
app.use(bodyParser.json());

// connect to data base
mongoose
  .connect('mongodb://admin:foxer123admin@ds243931.mlab.com:43931/firstreactapp') //возвращает Promise
  .then(() => console.log('connected to mongoDB'))
  .catch(err => console.log(err));

// USE ROUTES
app.use('/api/users', users);
app.use('/api/posts', posts);

if (process.env.NODE_ENV) {
  app.use(express.static('./client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
  })
}

io.on('connection', socket => {

  console.log('a user connected to socket!');

  socket.on('viewMessages', req => {
    socket.join(req.userID);
    const res = [];
    User.findById(req.userID)
      .then(user => {
        if (!user.chatHistory) {
          socket.emit('viewMessages', res);

        } else {
          User.find({["chatHistory."+req.userID] : {$exists: true}})
            .then(users => {
              for (let i = 0; i < users.length; i++) {
                let reqUserChat = users[i].chatHistory[req.userID];
                let lastMessage = reqUserChat[reqUserChat.length - 1];
                lastMessage.receiverAvatar = users[i].avatar;
                lastMessage.receiverName = users[i].name;
                lastMessage.receiverID = users[i]._id;
                lastMessage.lastMessageUserID = lastMessage.senderID;
                lastMessage.senderID = req.userID;

                res.push(lastMessage);
              }
              socket.emit('viewMessages', res);
            });
        }
      });
  });

  socket.on('startDialog', req => {
    socket.join(req.receiverID+req.senderID);

    const res = [];
    User.findById(req.receiverID)
      .then(user => {
        res.push({name : user.name, avatar : user.avatar, id : user._id})
      })
      .then(() => {
        User.findById(req.senderID)
          .then(user => {
            if (user.chatHistory.hasOwnProperty(req.receiverID)) {
              res.push(user.chatHistory[req.receiverID]);
              socket.emit('startDialog', res);
            } else {
              res.push([]);
              socket.emit('startDialog', res)
            }
          });
      });
  });

  socket.on('sendMessage', req => {
    const { senderID, receiverID, name, text, date, senderAvatar } = req;
    let chatHistory;

    io.to(req.senderID + req.receiverID)
      .emit('sendMessage', {
        senderID : senderID,
        name : name,
        text : text,
        date : date
      });

    io.to(req.receiverID + req.senderID)
      .emit('sendMessage', {
        senderID : senderID,
        name : name,
        text : text,
        date : date
      });

    User.findById(req.receiverID)
      .then((user) => {
        const dataSender = {
          name : name,
          text : text,
          date : date,
          receiverAvatar : user.avatar,
          senderAvatar : senderAvatar,
          receiverID : receiverID,
          receiverName : user.name,
          senderID : senderID,
          lastMessageUserID : senderID,
        };

        const dataReceiver = {
          name : user.name,
          text : text,
          date : date,
          receiverAvatar : senderAvatar,
          senderAvatar : user.avatar,
          receiverID : senderID,
          receiverName : name,
          senderID : receiverID,
          lastMessageUserID : senderID,
        };

        io.to(req.senderID).emit('sendMessage', dataSender);
        io.to(req.receiverID).emit('sendMessage', dataReceiver);
      });

    User.findById(req.senderID)
      .then(user => {
        chatHistory = user.chatHistory;
        !chatHistory[receiverID]
          ? chatHistory[receiverID] = [{senderID : senderID, name : name, text : text, date : date}]
          : chatHistory[receiverID].push({senderID : senderID, name : name, text : text, date : date});
      })
      .then(() => {
        User.update(
          {_id: senderID},
          {chatHistory : chatHistory},
          function(err, numberAffected, rawResponse) {
            //handle it
          }
        );

        User.findById(req.receiverID)
          .then(user => {
            chatHistory = user.chatHistory;
            !chatHistory[senderID]
              ? chatHistory[senderID] = [{senderID : senderID, name : name, text : text, date : date}]
              : chatHistory[senderID].push({senderID : senderID, name : name, text : text, date : date});
          })
          .then(() => {
            User.update(
              {_id: receiverID},
              {chatHistory : chatHistory},
              function(err, numberAffected, rawResponse) {
                //handle it
              }
            )
          });
      })
  });
});

http.listen(port, () => console.log(`server is running on port ${port}`));
