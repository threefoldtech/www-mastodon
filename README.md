# WWW-MASTODON

## Table of contents

1. [How to include weblet in another website?](#how-to-include-weblet-in-another-website)
2. [Provider ID](#provider-id)

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

### Provider ID

If u didn't add a **Provider ID**. User will be asked to enter a valid id or stick to our default id(1).
![image](https://user-images.githubusercontent.com/31689104/207612081-126a8a24-820a-420e-849a-5faa78df4227.png)

If u add a **Provider ID**. you will get _Credentials_ as first page.

```html
<tf-mastodon provider="your-provider-id"></tf-mastodon>
```
![image](https://user-images.githubusercontent.com/31689104/207612152-3069fc8c-25f5-49ed-a2a6-c0cdf37a7639.png)
