import { Card, CardContent, CircularProgress, Grid, ListItem, ListItemText, Paper, Typography } from '@material-ui/core';
import * as _ from 'lodash';
import * as React from 'react';
import styled from 'styled-components';
import { Blockchain, BlockchainTX, fetchLatestBlock, fetchTransaction } from './api/blockchain';
import { DemoHeader } from './header';
import colors from './styles/colors';
const Infinite = require('react-infinite'); // unfortunately the author of this code didn't provide a kind way to use it w/ TypeScript


const PageWrapper = styled.div`
  margin-top: 1rem;
`;

const TransactionsList = styled.ul`
  max-height: ${document.documentElement.clientHeight - 80}px;
  overflow-y: auto;

  > * {
    cursor: pointer;

    &:hover {
      background: ${colors.black15};
    }
  }
`;

const LoaderWrapper = styled.div`
  text-align: center;
`;

const PageLoaderWrapper = styled(LoaderWrapper)`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

interface LocalProps {

}

interface LocalState {
  menuIsOpen: boolean

  latestBlock: Blockchain | null
  fetchingLatestBlock: boolean

  transactions: {
    [key: number]: {
      fetching: boolean
      data: BlockchainTX | null
    }
  }
  selectedTXIndex: number
}

class App extends React.Component<LocalProps, LocalState> {
  constructor(props: LocalProps) {
    super(props);

    this.state = {
      menuIsOpen: false,
      latestBlock: null,
      fetchingLatestBlock: false,
      transactions: {},
      selectedTXIndex: 0
    };
  }

  public componentDidMount() {
    this.initFechLatestBlock();
  }

  public initFechLatestBlock = async () => {
    // loading spinner
    this.setState({
      fetchingLatestBlock: true
    });
    const latestBlockResp = await fetchLatestBlock();
    this.setState({
      fetchingLatestBlock: false
    });
    if (_.isEmpty(latestBlockResp.results) || !latestBlockResp.success) {
      return; // @TODO handle error
    }

    const latestBlock = latestBlockResp.results as Blockchain;

    this.setState({
      latestBlock
    });

    // initiate the first transaction
    this.goToTransaction(_.first(latestBlock.txIndexes) as number);
  };

  public render() {
    const {
      latestBlock
    } = this.state;

    return (
      <div className="App">
        <DemoHeader />

        <PageWrapper>
          {this.renderPageHeading()}

          {latestBlock && (
            <Grid container={true} spacing={8}>
              <Grid item={true} sm={6} md={3}>
                <Paper>
                  <Typography variant='h6' align='center'>Transactions for Latest Block</Typography>
                  <TransactionsList>
                    <Infinite // used to optimize rendering -- so that evertime a state change happens, it doesn't have to re-render 2300 list items unnecessarily (drastically improves page speed)
                      elementHeight={46}
                      containerHeight={document.documentElement.clientHeight - 200}>
                      {latestBlock.txIndexes.map(txIndex => (
                        <ListItem
                          key={txIndex}
                          onClick={() => this.goToTransaction(txIndex)}
                          selected={txIndex === this.state.selectedTXIndex}>
                          <ListItemText primary={txIndex} />
                        </ListItem>
                      ))}
                    </Infinite>
                  </TransactionsList>
                </Paper>
              </Grid>

              <Grid item={true} sm={6} md={8}>
                {this.renderTX()}
              </Grid>
            </Grid>
          )}
        </PageWrapper>
      </div >
    );
  }

  public renderPageHeading = () => {
    if (this.state.fetchingLatestBlock) {
      return (
        <PageLoaderWrapper>
          <CircularProgress variant='indeterminate' />
        </PageLoaderWrapper>
      );
    }
    if (!this.state.latestBlock) {
      return <Typography align='center' variant='h2'>Could not fetch latest Block</Typography>;
    }
    return null;
  };

  public renderTX = () => {
    const {
      transactions,
      selectedTXIndex
    } = this.state;

    if (!selectedTXIndex) {
      return null;
    }

    const tx = transactions[selectedTXIndex];

    if (!tx || tx.fetching) {
      return (
        <Card>
          <CardContent>
            <LoaderWrapper>
              <CircularProgress variant='indeterminate' />
            </LoaderWrapper>
          </CardContent>
        </Card>
      );
    }

    if (transactions[selectedTXIndex]) {
      const txData = tx.data as BlockchainTX;
      const txTotalIn = txData.inputs.reduce((sum, input) => {
        sum += Number(input.value);
        return sum;
      }, 0);
      const txTotalOut = txData.out.reduce((sum, out) => {
        sum += Number(out.value);
        return sum;
      }, 0);
      const txDirection = txTotalIn > 0;

      return (
        <Card>
          <CardContent>
            <Typography gutterBottom={true}>{selectedTXIndex}</Typography>
            <Typography variant='h5' component='h2'>{txDirection ? `Received ${txTotalIn}` : `Spent ${txTotalOut}`}</Typography>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardContent>
          <Typography gutterBottom={true}>{selectedTXIndex}</Typography>
          <Typography variant='h5' component='h2'>Could not fetch transaction</Typography>
        </CardContent>
      </Card>
    );
  };

  private goToTransaction = async (txIndex: number) => {
    this.setState({
      selectedTXIndex: txIndex
    });

    // check if transaction has already been fetched and use the locally cached one instead
    if (this.state.transactions[txIndex] && !_.isEmpty(_.get(this.state.transactions[txIndex], 'data'))) {
      return;
    }

    // add loading spinner for tx section
    this.setState({
      transactions: {
        ..._.cloneDeep(this.state.transactions),
        [txIndex]: {
          fetching: true,
          data: null
        }
      }
    });
    fetchTransaction(txIndex).then(resp => {
      // using non-blocking call so that user can click through other options (improves the feel of the app)
      if (!resp.results || !resp.success) {
        return; // @TODO handle error
      }

      this.setState({
        transactions: {
          ..._.cloneDeep(this.state.transactions),
          [txIndex]: {
            fetching: false,
            data: resp.results
          }
        }
      });
    });
  };

}

export default App;
