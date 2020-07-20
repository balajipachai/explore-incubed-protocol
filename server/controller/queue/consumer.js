const { Kafka } = require('kafkajs');

const { json } = require('express');
const { sendTransaction } = require('../utils/bitcoin');
const { getTopics } = require('./admin');


const blockchains = {
  bitcoin: sendTransaction,
};
const kafka = new Kafka({
  clientId: 'blockchain-queue',
  brokers: ['localhost:9092'],
});


const consumer = kafka.consumer({ groupId: 'blockchain' });

const run = async () => {
  await consumer.connect();
  await getTopics.forEach(async (topic) => {
    await consumer.subscribe({ topic, fromBeginning: true });
  });
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const result = await blockchains[topic](json.parse(message.value));

      // Here there should be a socket call
    },
  });
};

module.exports = {
  run,
};
