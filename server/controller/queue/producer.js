const amqp = require('amqplib/callback_api');

const sendMessage = async (params) => {
  amqp.connect('amqp://localhost', (error0, connection) => {
    if (error0) {
      throw error0;
    }
    connection.createChannel((error1, channel) => {
      if (error1) {
        throw error1;
      }
      const queue = 'task_queue';

      channel.assertQueue(queue, {
        durable: true,
      });
      channel.sendToQueue(queue, Buffer.from(JSON.stringify(params)), {
        persistent: true,
      });
      console.log('Sent \n', params);
    });
  });
};

module.exports = {
  sendMessage,
};

// sendMessage({
//   test: 'done',
// });
