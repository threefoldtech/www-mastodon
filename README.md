# WWW-MASTODON

### How to include weblet in another website?

1. Clone the project

```sh
git clone https://github.com/threefoldtech/www-mastodon.git

# Change directory inside project
cd ./www-mastodon
```

2. Install project dependencies

```sh
yarn install
```

3. Build project

```sh
yarn build
```

4. Copy all files in _./dist_ folder into your project (for e.g in _./weblet_)

5. Import scripts in your project

```html
<script src="./weblet/config.js"></script>
<script defer src="./weblet/mastodon.js"></script>
```

6. Use weblet within your templates

```html
<!DOCTYPE html>
<html>
  <head>
    <!-- Code... -->
    <script src="./weblet/config.js"></script>
    <script defer src="./weblet/mastodon.js"></script>
  </head>
  <body>
    <tf-mastodon provider="your-provider-id"></tf-mastodon>
    <tf-mastodon-list></tf-mastodon-list>
  <body>
</html>
```
