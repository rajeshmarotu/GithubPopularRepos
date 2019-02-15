import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, ActivityIndicator,ImageBackground, Image, FlatList, TouchableOpacity, Linking } from 'react-native';
import { List, ListItem } from 'react-native-elements';

import { Header } from './src/components/Header.component';

const options = {
   headers: {
            'Authorization': 'token YOUR_PERSONAL_ACCESS_TOKEN'
          }
}

export default class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      data:[],
      loading:'initial',
      error:'',
      length: 0,
      languageRepos:{},
      loadSplashScreen:false,
      isClicked:{

      },
      dataSource:[

      ]
    }
    this.repoView = [];
  }

  componentDidMount(){
      setTimeout( () => {
          this.stopRenderSplash();
          this.loadData()
      },2000);
  }

  componentWillReceiveProps(newProps){
    console.log(newProps);
    // this.setState({
    //     location: newProps.location
    // })
  }

  stopRenderSplash(){
    this.setState({loadSplashScreen:true,loading:true})
  }

  loadData(){
      fetch('https://api.github.com/search/repositories?q=stars%3A>1000&sort=stars&order=desc&per_page=10',options).then(res=>res.json()).then(results=>{
        console.log(results);
        var urls=[]
        results['items'].forEach( result => {
            urls.push(fetch(result.languages_url,options).then(r => r.json()));
        })
        return urls;
      }).then(urls => {
        var data = {};
        var keys=[];
        return Promise.all(
          urls
        ).then(languages=>{
          languages.forEach(item=>{
            for(var language in item){
              if(language in data){
                data[language]+=item[language]
              }else{
                data[language]=item[language]
                keys.push(language)
              }
            }
          })
          return keys;
        }).then(keys=>{
          var mostUsedLanguages=[];
          mostUsedLanguages = keys.sort(function(a,b){return data[b]-data[a]});
          return mostUsedLanguages;
        });
      }).then((langs)=>{

          fetch('https://api.github.com/search/repositories?q=topic%3A'+langs[0]+'&type=Repositories&sort=stars&order=desc&per_page=10',options)
          .then(r => r.json())
          .then(topLangData=>{
            var topLangItems = topLangData['items'];
            // console.log(topLangItems);
            var Data = this.state.dataSource;
            var isClicked=[]
            langs.slice(0,10).forEach((lang,i)=>{
              isClicked[lang]= (i==0)?true:false;
              Data.push({
                language:lang,
                isLoaded:false,
                items:i==0?(topLangItems):[]
              })
            })
            this.setState({
              isClicked:isClicked,
              dataSource:Data,
              loading:false
            })
          })

      })
  }

  renderSplashScreen(){
    return (
      <ImageBackground source={require('./assets/images/white_bg.jpeg')} style={{width: '100%', height: '100%'}}>
        <View style={{padding:'10%',justifyContent:'center',alignItems:'center'}}>
            <Image
              style={{width:'35%', height:'35%',marginTop:'50%',alignSelf:'center'}}
              source={{uri: 'https://facebook.github.io/react-native/docs/assets/favicon.png'}}
            />
            <Text style={{fontSize:30,marginTop:'5%'}}>
              GitHub
            </Text>
            <Text style={{fontSize:25,marginTop:'5%'}}>
              Popular Repos
            </Text>

        </View>
      </ImageBackground>
    )
  }

  keyExtractor = (item, index) => index



  renderRepositoriesLanguageWise = ({ item }) =>{

    var returnValue = [];
    var index = this.state.dataSource.map(e=>e.language).indexOf(item.language);
    console.log('renderRepo'+index);
    returnValue.push(this.renderItem(item["items"],item.language,index));
    return returnValue;
  }

  buildRow = (items,language,row_no) => {
    console.log('buildRow'+language);
    var cols = []
    for(var i = 0; i<2;i++){
      var position = row_no*2+i;
      var odd = true;
      if((position+1)%2==0){
        odd=false;
      }
      if(position<10){
        cols.push(
            <View style={{flex:0.5}} key={language+"_"+row_no+"_"+i}>
              {
                <ListItem
                  title={
                    <TouchableOpacity onPress={()=> Linking.openURL(items[position]['owner'].html_url) }>
                      <Text style={{color:'black',fontWeight:'500'}}>{items[position].name}</Text>
                    </TouchableOpacity>
                    }
                  subtitle={
                    <TouchableOpacity onPress={()=> Linking.openURL(items[position]['owner'].html_url) }>
                      <Text style={{color:'blue'}}>{items[position]['owner'].login}</Text>
                    </TouchableOpacity>
                  }
                  leftAvatar={{
                    source: items[position]['owner'].avatar_url && { uri: items[position]['owner'].avatar_url },
                    title: items[position].name[0]
                  }}
                  contentContainerStyle={{width:'100%',height:'7%',paddingRight:`${odd}`==true?1:0}}
                />
              }
            </View>
        )
      }
    }
    return (
        <View key={language+"_"+row_no} style={{flexDirection:'row',paddingVertical:'1%'}}>
            {
              cols
            }
        </View>
      );
  }


  toggleRepos(language,index){
      let isClicked = Object.assign({}, this.state.isClicked);
      var height = '7%',opacity = 1;

      if(isClicked[language]){
        height=0;
        opacity=0;
      }
      this.repoView[index].setNativeProps({width:'100%',height:height,opacity:opacity });
      isClicked[language]=!isClicked[language];
      this.setState({isClicked:isClicked});

  }

  loadRepoData(length,language,index){
    if(length==0){

      fetch('https://api.github.com/search/repositories?q=topic%3A'+language+'&type=Repositories&sort=stars&order=desc&per_page=10',options)
      .then(r => r.json())
      .then(langData=>{
        var langItems = langData['items'];
        const newData = [...this.state.dataSource]
        newData[index].items=langItems;
        newData[index].isLoaded=true;
        this.setState({dataSource:newData})
      })

    }else{
      return;
    }
  }

  renderItem = (items,language, index) => {
    console.log("renderItem"+index);
    var l = [0,1,2,3,4]
    return (
        <View  key={language} style={{flexDirection:'column',paddingVertical:'2%'}}>
          <View style={{flex:0.2,backgroundColor:'#cdcdcd'}}>
            <TouchableOpacity onPress={()=> {this.toggleRepos(language,index);this.loadRepoData(items.length,language,index)}}>
              <Text style={{fontSize:24,fontWeight:'600',color:'#fff'}}>#{index+1}&nbsp;&nbsp;{language}</Text>
            </TouchableOpacity>
          </View>

              <View key={language+"#repos"} ref={(ref) => this.repoView[index] = ref}  style={{flex:0.8,flexDirection:'column'}}>
                {
                  items.length!=0 && l.map((row_no)=>{
                    return (
                        this.buildRow(items,language,row_no)
                    )
                  })
                }
                {
                  items.length==0 && this.state.isClicked[language]==true && this.state.dataSource.filter(item=>{ return item.language==language})[0].isLoaded == false &&(
                    <ActivityIndicator size="large" color="#0000ff" />
                  )
                }
              </View>
        </View>
      )
  }


  render(){

    const { loading,dataSource,isClicked } = this.state;
    // console.log(isClicked);
    if(!this.state.loadSplashScreen){
      return (
        <View style={[styles.container,{justifyContent:'center',alignItems:'center'}]}>
            {this.renderSplashScreen()}
        </View>
      )
    }

    if( this.state.loadSplashScreen && loading == true ){
      return(
        <View style={[styles.container,{justifyContent:'center',alignItems:'center'}]}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )
    }
    if( loading == false ){
      return(
        <View style={[styles.container,{flex:1,flexDirection:'column'}]}>
          <View style={{flex:0.15}}>
            <Header />
          </View>
          <View style={{flex:0.85,flexDirection:'column'}}>
            <View style={{flexDirection:'column'}}>
              <FlatList
                keyExtractor={this.keyExtractor}
                data={this.state.dataSource}
                renderItem={this.renderRepositoriesLanguageWise}
                extraData={this.state}
              />
            </View>
          </View>
        </View>
      )
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addMargin: {
    flex:0.45,
    marginRight:0.05
  },
  noMargin: {
    flex:0.50
  },
  shadowStyle: {
    borderWidth: 1,
    borderColor: '#cdcdcd',
    borderTopWidth: 0,
    borderLeftWidth:0,
    borderRightWidth:0,
    shadowColor: '#ddd',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 1,
    elevation: 1,
  }
});
