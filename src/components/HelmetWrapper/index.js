import React from 'react';
import { Helmet } from "react-helmet";

import { description, title, keywords } from '../../../config/siteMetadata';

const HelmetWrapper = () => (
  <Helmet 
      htmlAttributes={{"lang": "pt"}}
      title={title}
      meta={[
        {
          "name": "description",
          "content": description, 
        },
        {
          "name": "keywords",
          "content": keywords.join(', '),
        },
      ]}
    />
);

export default HelmetWrapper;
