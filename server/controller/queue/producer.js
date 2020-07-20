const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'blockchain-queue',
  brokers: ['localhost:9092'],
});

const producer = kafka.producer();

const sendMessage = async (topic, params) => {
  await producer.connect();
  await producer.send({
    topic,
    messages: [
      { value: JSON.stringify(params) },
    ],
  });
  await producer.disconnect();
  return {
    message: 'Message sent successfully',
  };
};

module.exports = {
  sendMessage,
};
