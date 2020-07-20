const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'blockchain-queue',
  brokers: ['localhost:9092'],
});

const admin = kafka.admin();

const createTopic = async (topic) => {
  await admin.connect();
  await admin.createTopics({
    validateOnly: false,
    waitForLeaders: false,
    timeout: 1000000,
    topics: [{
      topic,
    }],
  });
  await admin.disconnect();
  return {
    message: 'Topic created successfully',
  };
};

const deleteTopic = async (topic) => {
  await admin.connect();
  await admin.deleteTopics({
    timeout: 1000,
    topics: [{
      topic,
    }],
  });
  await admin.disconnect();
  return {
    message: 'Topic deleted successfully',
  };
};

const getTopics = async () => {
  const topicsMetaData = await admin.fetchTopicMetadata();
  const existingTopicNames = topicsMetaData.topics.map((topic) => topic.name);
  return existingTopicNames;
};

module.exports = {
  createTopic,
  deleteTopic,
  getTopics,
};
