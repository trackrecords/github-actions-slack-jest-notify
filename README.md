# Slack Jest Notify GitHub Action

## Setup

- [Create a slack app](https://api.slack.com/apps) for your workspace (alternatively use an existing app you have already created and installed)
  - Add the `chat.write` scope under **OAuth & Permissions**
- Install the app to your workspace

### Usage

```yaml
- name: Notify jest results to Slack
  if: failure()
  uses: trackrecords/github-actions-slack-jest-notify@main
  with:
    token: ${{ secrets.SLACK_BOT_TOKEN }}
    channel: "CHANNEL_ID" # Slack channel id to post message
    path: "result.json" # path to jest result json
```

### Build

```sh
yarn build
git add dist/index.js dist/licenses.txt
```

refs: https://docs.github.com/ja/actions/creating-actions/creating-a-javascript-action#commit-tag-and-push-your-action-to-github
