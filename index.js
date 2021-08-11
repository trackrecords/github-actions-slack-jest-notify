const fs = require("fs");
const { resolve } = require("path");
const core = require("@actions/core");
const github = require("@actions/github");
const { WebClient } = require("@slack/web-api");

function createAttachmentField(title, value) {
  return {
    title,
    value,
    short: false,
  };
}

function createAttachment(github, fields) {
  return {
    author_name: github.context.payload.sender.login,
    author_icon: github.context.payload.sender.avatar_url,
    color: "danger",
    fields,
  };
}

function createAttachmentHeader(github) {
  return createAttachment(github, [
    github.context.payload.compare
      ? createAttachmentField("Compare", github.context.payload.compare)
      : createAttachmentField(
          "PullRequest",
          github.context.payload.pull_request.html_url
        ),
  ]);
}

function createAttachmentBody(github, result) {
  return createAttachment(github, [
    createAttachmentField(result.name, "```" + result.message + "```"),
  ]);
}

try {
  const token = core.getInput("token");
  if (!token) throw new Error("token must be specified");

  const channel = core.getInput("channel");
  if (!channel) throw new Error("channel must be specified");

  const inputPath = core.getInput("path");
  if (!inputPath) throw new Error("path must be specified");

  const message = core.getInput("message") || "Failed Test";

  const path = /^\.?\.?\//.test(inputPath) ? inputPath : `./${inputPath}`;
  if (!fs.existsSync(path)) throw new Error(`${path} not found`);

  let json;
  try {
    json = require(resolve(path));
  } catch (err) {
    throw new Error(`${path} is not a valid json: ${err}`);
  }

  const attachments = [
    createAttachmentHeader(github),
    ...json.testResults
      .filter((result) => result.status === "failed")
      .map((result) => createAttachmentBody(github, result)),
  ];
  const web = new WebClient(token);
  web.chat.postMessage({
    channel,
    title: message,
    text: message,
    attachments,
  });
} catch (error) {
  core.setFailed(error.message);
}
