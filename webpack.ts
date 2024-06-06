import { CallableOption, WebpackConfiguration } from 'webpack-cli/lib/types';
import { ModuleOptions, Compiler as WebpackCompiler } from 'webpack';
import TerserPlugin from 'terser-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import ReactRefreshTypeScript from 'react-refresh-typescript';
import ReactRefreshPlugin from '@pmmmwh/react-refresh-webpack-plugin';

type LoaderType = 'typescript-file' | 'style-file';

export const getLoaderIndex = (
  type: LoaderType,
  rules: ModuleOptions['rules'],
): number => {
  return (rules || []).findIndex((rule) => {
    return Object.getOwnPropertySymbols(rule).some((symbol) => {
      return symbol.toString() === 'Symbol(webpack-rule-name)' && (rule as any)[symbol] === type;
    });
  });
};

export const adaptStorybookWebpackConfig = (
  config: WebpackConfiguration,
  options?: {
    modulesNamesToMap?: string[];
    aliases?: Required<WebpackConfiguration>['resolve']['alias'];
  },
): WebpackConfiguration => {
  const {
    modulesNamesToMap = [],
  } = options || {};

  config.resolve = {
    ...(config.resolve || {}),
  };

  if (options?.aliases) {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      ...options.aliases,
    };
  }

  const tsLoader = { loader: 'ts-loader' };

  config.module = {
    ...(config.module || {}),
    rules: [
      ...(config.module?.rules || []),
    ],
  };

  config.module.rules!.forEach((r: any) => {
    if (r?.test?.test?.('.tsx') || r?.test?.test?.('.ts')
    ) {
      r.use = [tsLoader];
    }
  });

  modulesNamesToMap.forEach((alias) => {
    config.module!.rules!.push({
      test: new RegExp(`${alias}\\/[^.]+\\.tsx?`, 'i'),
      use: [tsLoader],
    });
  });

  return config;
};

export const getDefaultConfig = (
  env: Parameters<CallableOption>[0],
  mode: string,
): WebpackConfiguration => {
  return {
    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
    },
    optimization: {
      minimizer: [
        new TerserPlugin({ extractComments: false }),
      ],
    },
    devServer: {
      hot: true,
      compress: true,
    },
    module: {
      rules: [
        {
          [Symbol('webpack-rule-name')]: 'typescript-file',
          test: /\.tsx?$/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                getCustomTransformers: () => ({
                  before: [
                    env?.WEBPACK_SERVE && ReactRefreshTypeScript(),
                  ].filter(Boolean),
                }),
                transpileOnly: true,
              },
            },
          ],
        },
        {
          [Symbol('webpack-rule-name')]: 'style-file',
          test: /\.(s[ac]ss|css)$/i,
          use: [
            env?.WEBPACK_SERVE ? 'style-loader' : MiniCssExtractPlugin.loader,
            'css-loader',
            'postcss-loader',
            'sass-loader',
          ],
        },
      ],
    },
    plugins: [
      env?.WEBPACK_SERVE && new ReactRefreshPlugin(),
      !env?.WEBPACK_SERVE && new MiniCssExtractPlugin({
        filename: '[name].css',
      }),
      {
        apply(compiler: WebpackCompiler) {
          compiler.hooks.done.tap('webpackOnDone', () => {
            setTimeout(() => {
              console.log(`===> [${mode}] done`);
            }, 0);
          });
        },
      },
    ].filter(Boolean),
  } as WebpackConfiguration;
};
