import React, { Component } from 'react';
import './App.css';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

class App extends Component {
  constructor() {
    super();
    //ステートの初期化
    this.state = {
      selected: Array(47).fill(false),
      prefectures: {},
      series: []
    };
    //changeHandlerにthisをバインド
    this.changeHandler = this.changeHandler.bind(this)
  };

  //コンポーネントが生成された直後にAPIから都道府県名を取得
  componentDidMount() {
    fetch('https://opendata.resas-portal.go.jp/api/v1/prefectures', {
      headers: { 'X-API-KEY': "APIkey" }//APIキーを貼り付け
    })
      .then(response => response.json())
      .then(res => {
        this.setState({ prefectures: res.result });
      });
  }

  changeHandler(index) {
    //ステートの状態をコピーする
    const selectedCopy = this.state.selected.concat();
    //selectedCopyの真偽値を反転
    selectedCopy[index] = !selectedCopy[index];
    if (this.state.selected[index]) {
      //ステートの状態をコピー
      const series_copy = this.state.series.concat();
      //既にチェック済みの場合はグラフから削除
      for (let i = 0; i < series_copy.length; i++) {
        if (series_copy[i].name === this.state.prefectures[index].prefName) {
          series_copy.splice(i, 1);
        }
      }
      //ステートを更新
      this.setState({
        selected: selectedCopy,
        series: series_copy
      });
    } else {
      //まだチェックされていなかった場合はAPIからデータを取得
      fetch(`https://opendata.resas-portal.go.jp/api/v1/population/composition/perYear?cityCode=-&prefCode=${index + 1}`,
        {
          headers: { 'X-API-KEY': "TGbLelROJc6WGTGLP7m3fuBB8CaOeMcbAIjHpzZ2" }
        }
      )
        .then(response => response.json())
        .then(res => {
          let tmp = [];
          Object.keys(res.result.data[0].data).forEach(i => {
            tmp.push(res.result.data[0].data[i].value);
          });
          const res_series = {
            name: this.state.prefectures[index].prefName,
            data: tmp
          };
          //取得したデータをステートに更新（元からあるデータを保持）
          this.setState({
            selected: selectedCopy,
            series: [...this.state.series, res_series]
          });
        });
    }
  }

  //チェックボックスを生成するJSX
  checkBoxes(props) {
    return (
      <div
        key={props.prefCode}
        style={{ margin: '5px', display: 'inline-block' }}
      >
        <input
          type="checkbox"
          checked={this.state.selected[props.prefCode - 1]}
          onChange={() => this.changeHandler(props.prefCode - 1)}
        />
        {props.prefName}
      </div>
    );
  }

  render() {
    const obj = this.state.prefectures;
    //heightchartsのオプション
    const options = {
      xAxis: {
        title: {
          text: "年"
        },
        max: 2020
      },
      yAxis: {
        title: {
          text: "人口数"
        },
        labels: {
          formatter: function () {
            return this.value / 10000 + "万人";
          }
        }
      },
      title: {
        text: '人口増減率'
      },
      legend: {
        layout: "vertical",
        align: "right",
        verticalAlign: "middle"
      },
      plotOptions: {
        series: {
          label: {
            connectorAllowed: true
          },
          pointInterval: 10,
          pointStart: 1980,
        }
      },
      series: this.state.series
    };

    return (
      <div style={{
        maxWidth: "1000px", margin: "0 auto"
      }
      }>
        <h1>都道府県別に見る総人口の推移</h1>
        {Object.keys(obj).map(i => this.checkBoxes(obj[i]))}
        <HighchartsReact highcharts={Highcharts} options={options} />
      </div >
    );
  }
}

export default App;
