import { AppBar, Typography } from '@material-ui/core';
import * as React from 'react';
import styled from 'styled-components';

const HeaderWrapper = styled.div`
  width: 100%;
`;

const TypographyWrapper = styled.div`
  padding: 10px 20px;
`;

export const DemoHeader = () => {
  return (
    <HeaderWrapper>
      <AppBar position="static">
        <TypographyWrapper>
          <Typography variant='h5' color='inherit'>Chainyard Blockchain Test</Typography>
        </TypographyWrapper>
      </AppBar>
    </HeaderWrapper>
  );
}