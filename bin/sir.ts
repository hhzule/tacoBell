#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { SirStack } from '../lib/sir-stack';

const app = new cdk.App();
new SirStack(app, 'SirStack');
