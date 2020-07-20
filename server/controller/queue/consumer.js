const { Kafka } = require('kafkajs');
const jsonFormat = require('json-format');

const { sendTransaction } = require('../../utils/');
const logger = require('../../config/winston');

const kafka = new Kafka({
  clientId: 'blockchain-queue',
  brokers: ['localhost:9092'],
});


const consumer = kafka.consumer({ groupId: 'blockchain' });

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'GOERLI', fromBeginning: true });
  await consumer.subscribe({ topic: 'KOVAN', fromBeginning: true });
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const transaction = jsonFormat(JSON.parse(message.value));
      const receipt = await sendTransaction(topic, transaction);
      logger.info('Receipt is: ', receipt);
      return receipt;
      // Here there should be a socket call
    },
  });
};

module.exports = {
  run,
};

run();
