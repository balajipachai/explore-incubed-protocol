const jsonFormat = require('json-format');
const amqp = require('amqplib/callback_api');

const { sendTransaction } = require('../../utils/');
const logger = require('../../config/winston');


const run = async () => {
  amqp.connect('amqp://localhost', (error, connection) => {
    connection.createChannel((err, channel) => {
      if (err) {
        throw err;
      }
      const queue = 'task_queue';
      channel.assertQueue(queue, {
        durable: true,
      });
      channel.prefetch(1);
      channel.consume(queue, async (msg) => {
        console.log('Received message: ', msg.content.toString());
        const transaction = jsonFormat(JSON.parse(msg.content.toString()));
        const receipt = await sendTransaction('GOERLI', transaction);
        logger.info(`Transaction processed: ${JSON.stringify(receipt)}`);
        console.log('Transaction processed: ', JSON.stringify(receipt));
      }, {
        noAck: true,
      });
    });
  });
};

module.exports = {
  run,
};

run();
