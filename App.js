import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, ActivityIndicator,ImageBackground, Image, FlatList, TouchableOpacity, Linking } from 'react-native';
import { List, ListItem, Icon } from 'react-native-elements';

import { Header } from './src/components/Header.component';

const options = {
   headers: {
            'Authorization': 'token YOUR_GITHUB_PERSONAL_ACCESS_TOKEN'
          }
}

export default class App extends Component {

          constructor(props){
            super(props);
            this.state = {
              loading:'initial',
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

          /*
            Stop Displaying Splash Screen After 2Secs
          */
          stopRenderSplash(){
            this.setState({loadSplashScreen:true,loading:true})
          }

          /*
            Method To Fetch Data From GitHub API
          */
          loadData(){
              fetch('https://api.github.com/search/repositories?q=stars%3A>0&sort=stars&order=desc&per_page=10',options)
              .then(res=>res.json())
              .then(results=>{

                /*
                  Get All Repositories With Most Stars (10 Repos )
                */
                var urls=[]
                results['items'].forEach( result => {
                    urls.push(fetch(result.languages_url,options).then(r => r.json()));
                })

                /*
                  Return All URL for Languages Of Repositories
                */
                return urls;
              })
              .then(urls => {
                var data = {};
                var keys=[];
                return Promise.all(urls)
                              .then(languages=>{
                                /*
                                  Sum up the values of each language from All Top repositories.
                                */
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
                              })
                              .then(keys=>{

                                /*
                                  Sort languages based on above computed value -- Descending order
                                */
                                var mostUsedLanguages=[];
                                mostUsedLanguages = keys.sort(function(a,b){return data[b]-data[a]});
                                return mostUsedLanguages;
                              });
              })
              .then((langs)=>{

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


        /*
          Build a row containing 2 columns. Each column contains user_pic, repository_name, owner_name
          with availabilty to open it in browser
        */
        buildRow = (items,language,row_no) => {
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

        /*
          Toggle Repository With Option To View Top Repositories Of A Language Or Minimize.
        */
        toggleRepos(language,index){
            let isClicked = Object.assign({}, this.state.isClicked);
            var height = '7%',opacity = 1;
            if(isClicked[language]){
              height=0;
              opacity=0;
            }

            /*
              Hide View By Using Ref.
            */
            this.repoView[index].setNativeProps({width:'100%',height:height,opacity:opacity });
            isClicked[language]=!isClicked[language];
            this.setState({isClicked:isClicked});
        }


      /*
        Load Repository Data Into State and Set isLoaded Status To TRUE
      */
      loadRepoData(length,language,index){
        /* If Data Is Previously Not Loaded */
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



    /*
      Render Top 10 Repositories Of A Language. Contains Language Header and 5 Repository Rows Each Containing 2 Columns
    */

    renderItem = (items,language, index) => {
      console.log("renderItem"+index);
      var l = [0,1,2,3,4]
      return (
          <View  key={language} style={{flexDirection:'column',paddingTop:'1%'}}>

            <View style={{flex:0.2,backgroundColor:'#cdcdcd',flexDirection:'row'}}>

              <View style={{flex:0.8,paddingVertical:'3%',paddingLeft:'2%'}}>
                <Text style={{fontSize:24,fontWeight:'600',color:'#fff'}}>#{index+1}&nbsp;&nbsp;{language}</Text>
              </View>

              {/*   On Clicking Chevron-Down Icon Toggle Display and Load Repository Data Of Language If Not Loaded */}

              <View style={{flex:0.2,alignItems:'center'}}>
                <Icon
                  raised
                  name={this.state.isClicked[language]==true?'chevron-up':'chevron-down'}
                  type='font-awesome'
                  color={this.state.isClicked[language]==true?'black':'#cdcdcd'}
                  size={20}
                  onPress={() => { this.toggleRepos(language,index);this.loadRepoData(items.length,language,index) }} />
              </View>

            </View>

            {/* Rows */}
            <View key={language+"#repos"} ref={(ref) => this.repoView[index] = ref}  style={{flex:0.8,flexDirection:'column'}}>

              {/* If Language's Repositories Are Loaded and have length > 0 Build 5 Rows */}
              {
                items.length!=0 && this.state.isClicked[language]==true && l.map((row_no)=>{
                  return (
                      this.buildRow(items,language,row_no)
                  )
                })
              }

              {/* Else Show Loading Indicator Till Data Gets Loaded */}
              {
                items.length==0 && this.state.isClicked[language]==true && this.state.dataSource.filter(item=>{ return item.language==language})[0].isLoaded == false &&(
                  <ActivityIndicator size="large" color="#0000ff"/>
                )
              }
            </View>

          </View>
        )
    }


  /*
    Render Repositories from Different Programming Languages and Append to View
  */
  renderRepositoriesLanguageWise = ({ item }) =>{

    var returnValue = [];
    var index = this.state.dataSource.map(e=>e.language).indexOf(item.language);
    console.log('renderRepo'+index);
    returnValue.push(this.renderItem(item["items"],item.language,index));
    return returnValue;
  }

  keyExtractor = (item, index) => index

  /*
    Render Splash Screen Method
  */
  renderSplashScreen(){
    return (
      <ImageBackground source={require('./assets/images/white_bg.jpg')} style={{width: '100%', height: '100%'}}>
        <View style={{padding:'10%',justifyContent:'center',alignItems:'center'}}>
            <Image
              style={{width:'50%', height:'40%',marginTop:'50%',alignSelf:'center'}}
              source={require('./assets/images/github.png')}
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


  render(){

    const { loading, dataSource } = this.state;
    /*
      Load Splash Screen
    */
    if(!this.state.loadSplashScreen){
      return (
        <View style={[styles.container,{justifyContent:'center',alignItems:'center'}]}>
            {this.renderSplashScreen()}
        </View>
      )
    }

    /*
      Show Loading Indicator
    */
    if( this.state.loadSplashScreen && loading == true ){
      return(
        <View style={[styles.container,{justifyContent:'center',alignItems:'center'}]}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )
    }

    /*
      After loading display Default screen with FlatList
    */
    if( loading == false ){
      return(
        <View style={[styles.container,{flex:1,flexDirection:'column'}]}>
          <View style={{flex:0.15}}>
            <Header />
          </View>
          <View style={{flex:0.85,flexDirection:'column',paddingHorizontal:'2%',marginBottom:'1%'}}>
            <View style={{flexDirection:'column'}}>
              <FlatList
                keyExtractor={this.keyExtractor}
                data={dataSource}
                renderItem={this.renderRepositoriesLanguageWise}
                extraData={this.state}
                showsVerticalScrollIndicator={false}
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
